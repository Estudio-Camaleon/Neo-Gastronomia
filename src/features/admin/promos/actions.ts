"use server";

import { createClient } from "@/core/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedTenant, parseStorageUrl } from "@/core/lib/tenant";
import { supabaseAdmin } from "@/core/lib/supabase/admin";
import { upsertPromoSchema } from "@/core/lib/schemas";
import { z } from "zod";

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

  const row = {
    negocio_id: negocioId,
    nombre: parsed.data.nombre,
    descripcion: parsed.data.descripcion ?? null,
    imagen_url: parsed.data.imagen_url ?? null,
    tipo_descuento: parsed.data.tipo_descuento,
    valor_descuento: parsed.data.valor_descuento,
    codigo: parsed.data.codigo ?? null,
    activo: parsed.data.activo,
    items_combo: parsed.data.tipo_descuento === "combo" ? parsed.data.items_combo : [],
  };

  const { error } = promoId
    ? await supabase.from("promos").update({ ...row, updated_at: new Date().toISOString() }).eq("id", promoId)
    : await supabase.from("promos").insert(row);

  if (error) {
    throw new Error(`Error al guardar la promo: ${error.message}`);
  }

  revalidatePath("/promos");

  return { success: true };
}

export async function deletePromoAction(promoId: string) {
  if (!promoId) throw new Error("ID de promo requerido.");

  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);

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

export async function togglePromoAction(promoId: string, activo: boolean) {
  if (!promoId) throw new Error("ID de promo requerido.");

  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);

  const { error } = await supabase
    .from("promos")
    .update({ activo })
    .eq("id", promoId)
    .eq("negocio_id", negocioId);

  if (error) {
    throw new Error(`Error al actualizar la promo: ${error.message}`);
  }

  revalidatePath("/promos");

  return { success: true };
}
