"use server";

import { createClient } from "@/core/lib/supabase/server";
import { supabaseAdmin } from "@/core/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { getAuthenticatedTenant, parseStorageUrl } from "@/core/lib/tenant";
import { upsertPromoSchema } from "@/core/lib/schemas";
import type { Json } from "@/core/types/database.types";
import { z } from "zod";

async function getSlugForTenant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  negocioId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("negocios")
    .select("slug")
    .eq("id", negocioId)
    .single();
  return data?.slug ?? null;
}

export async function getPromosAction() {
  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);

  const { data } = await supabase
    .from("promos")
    .select("*")
    .eq("negocio_id", negocioId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function upsertPromoAction(
  payload: z.infer<typeof upsertPromoSchema>,
  promoId?: string,
) {
  const parsed = upsertPromoSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Datos inválidos.");
  }

  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);
  const slug = await getSlugForTenant(supabase, negocioId);

  if (parsed.data.codigo) {
    const { data: existing } = await supabase
      .from("promos")
      .select("id")
      .eq("negocio_id", negocioId)
      .eq("codigo", parsed.data.codigo)
      .maybeSingle();

    if (existing && existing.id !== promoId) {
      throw new Error("Ya existe una promoción con ese código");
    }
  }

  const aplicarA = parsed.data.aplicar_a ?? null;

  const row = {
    negocio_id: negocioId,
    nombre: parsed.data.nombre,
    descripcion: parsed.data.descripcion ?? null,
    imagen_url: parsed.data.imagen_url ?? null,
    tipo_descuento: parsed.data.tipo_descuento,
    valor_descuento: parsed.data.valor_descuento,
    codigo: parsed.data.codigo ?? null,
    activo: parsed.data.activo,
    fecha_inicio: parsed.data.fecha_inicio ?? null,
    fecha_fin: parsed.data.fecha_fin ?? null,
    items_combo: parsed.data.tipo_descuento === "combo" ? parsed.data.items_combo : [],
    aplicar_a: aplicarA as unknown as Json,
  };

  const { error } = promoId
    ? await supabase.from("promos").update({ ...row, updated_at: new Date().toISOString() }).eq("id", promoId)
    : await supabase.from("promos").insert(row);

  if (error) {
    throw new Error(`Error al guardar la promo: ${error.message}`);
  }

  revalidatePath("/promos");
  if (slug) revalidatePath(`/${slug}`);

  return { success: true };
}

export async function deletePromoAction(promoId: string) {
  if (!promoId) throw new Error("ID de promo requerido.");

  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);
  const slug = await getSlugForTenant(supabase, negocioId);

  const { data: promo } = await supabase
    .from("promos")
    .select("imagen_url")
    .eq("id", promoId)
    .eq("negocio_id", negocioId)
    .single();

  if (promo?.imagen_url) {
    const parsed = parseStorageUrl(promo.imagen_url);
    if (parsed) {
      await supabaseAdmin.storage.from(parsed.bucket).remove([parsed.path]);
    }
  }

  const { error } = await supabase
    .from("promos")
    .delete()
    .eq("id", promoId)
    .eq("negocio_id", negocioId);

  if (error) {
    throw new Error(`Error al eliminar la promo: ${error.message}`);
  }

  revalidatePath("/promos");
  if (slug) revalidatePath(`/${slug}`);

  return { success: true };
}

export async function getComboProductsAction() {
  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);

  const { data } = await supabase
    .from("productos")
    .select("id, nombre, precio")
    .eq("negocio_id", negocioId)
    .eq("disponible", true)
    .order("nombre");

  return data ?? [];
}

export async function getProductsAndCategoriesAction() {
  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);

  const [productosRes, categoriasRes] = await Promise.all([
    supabase
      .from("productos")
      .select("id, nombre, precio")
      .eq("negocio_id", negocioId)
      .eq("disponible", true)
      .order("nombre"),
    supabase
      .from("categorias")
      .select("id, nombre")
      .eq("negocio_id", negocioId)
      .order("nombre"),
  ]);

  return {
    productos: productosRes.data ?? [],
    categorias: categoriasRes.data ?? [],
  };
}

export async function togglePromoAction(promoId: string, activo: boolean) {
  if (!promoId) throw new Error("ID de promo requerido.");

  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);
  const slug = await getSlugForTenant(supabase, negocioId);

  const { error } = await supabase
    .from("promos")
    .update({ activo })
    .eq("id", promoId)
    .eq("negocio_id", negocioId);

  if (error) {
    throw new Error(`Error al actualizar la promo: ${error.message}`);
  }

  revalidatePath("/promos");
  if (slug) revalidatePath(`/${slug}`);

  return { success: true };
}

/** Revisa promos activas próximas a vencer y emite notificación promo_ending si no se envió antes */
export async function checkPromosExpiringAction() {
  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);

  // 1. Verificar preferencia: si está deshabilitada, salir
  const { data: pref } = await supabase
    .from("notification_preferences")
    .select("enabled")
    .eq("negocio_id", negocioId)
    .eq("notification_type", "promo_ending")
    .maybeSingle();

  if (pref && !pref.enabled) return { sent: 0 };

  // 2. Buscar promos activas que vencen en los próximos 3 días
  const ahora = new Date().toISOString();
  const en3Dias = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data: promosPorVencer } = await supabase
    .from("promos")
    .select("id, nombre, fecha_fin")
    .eq("negocio_id", negocioId)
    .eq("activo", true)
    .gte("fecha_fin", ahora)
    .lte("fecha_fin", en3Dias);

  if (!promosPorVencer || promosPorVencer.length === 0) return { sent: 0 };

  // 3. Para cada promo, verificar si ya se notificó (data->>promo_id)
  const yaNotificadas = new Set<string>();

  const { data: notifsExistentes } = await supabase
    .from("notifications")
    .select("data")
    .eq("negocio_id", negocioId)
    .eq("type", "promo_ending")
    .not("data", "is", null);

  if (notifsExistentes) {
    for (const n of notifsExistentes) {
      const promoId = (n.data as Record<string, unknown> | null)?.["promo_id"];
      if (typeof promoId === "string") yaNotificadas.add(promoId);
    }
  }

  let sent = 0;

  for (const promo of promosPorVencer) {
    if (yaNotificadas.has(promo.id)) continue;

    const faltanMs = new Date(promo.fecha_fin!).getTime() - Date.now();
    const faltanHoras = Math.round(faltanMs / (1000 * 60 * 60));
    const title = `Promoción por vencer`;
    const body =
      faltanHoras < 24
        ? `"${promo.nombre}" vence en menos de ${faltanHoras}h`
        : `"${promo.nombre}" vence en ${Math.round(faltanHoras / 24)} días`;

    const { error } = await supabaseAdmin.from("notifications").insert({
      negocio_id: negocioId,
      type: "promo_ending",
      title,
      body,
      data: { promo_id: promo.id },
    });

    if (!error) sent++;
  }

  return { sent };
}
