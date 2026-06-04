"use server";

import { createClient } from "@/core/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { extractStoragePath } from "@/core/lib/tenant";
import { supabaseAdmin } from "@/core/lib/supabase/admin";
import type { UpdateTenantBrandingPayload } from "@/core/types/domain";
import type { Json } from "@/core/types/database.types";

/**
 * Pone al día la identidad corporativa de un negocio mitigando escaladas RLS.
 */
export async function updateTenantBrandingAction(
  payload: UpdateTenantBrandingPayload,
) {
  const supabase = await createClient();

  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Acceso denegado. Terminal no autenticada.");

  const { data: negociosActuales, error: currentError } = await supabase
    .from("negocios")
    .select("logo_url, banner_url")
    .eq("id", payload.id)
    .eq("user_id", user.id)
    .limit(1);

  const negocioActual = negociosActuales?.[0] ?? null;
  if (currentError || !negocioActual) {
    throw new Error("No se pudo leer el estado actual del negocio.");
  }

  // Sanitización determinista del identificador web para URLs públicas
  const slugSaneado = payload.slug
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (slugSaneado.length < 3) {
    throw new Error("El identificador URL (Slug) es demasiado corto.");
  }

  // Actualización plana mapeada milimétricamente a la tabla public.negocios
  const { error } = await supabase
    .from("negocios")
    .update({
      nombre: payload.nombre.trim(),
      slug: slugSaneado,
      whatsapp: payload.whatsapp.trim(),
      direccion: payload.direccion.trim(),
      localidad: payload.localidad.trim(),
      direccion_notas: payload.direccion_notas.trim(),
      color_primary: payload.color_primary,
      logo_url: payload.logo_url,
      banner_url: payload.banner_url,
      instagram_url: payload.instagram_url.trim(),
      facebook_url: payload.facebook_url.trim(),
      tiktok_url: payload.tiktok_url.trim(),
      horarios: payload.horarios as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id)
    .eq("user_id", user.id); // Doble candado Multi-tenant para blindar aislamiento de datos

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "El identificador URL (Slug) ya se encuentra registrado por otra marca.",
      );
    }
    throw new Error(`Error de persistencia Core: ${error.message}`);
  }

  const brandingFilesToRemove: string[] = [];
  const previousLogoPath = extractStoragePath(
    negocioActual.logo_url,
    "imagenes-negocios",
  );
  const previousBannerPath = extractStoragePath(
    negocioActual.banner_url,
    "imagenes-negocios",
  );
  const nextLogoPath = extractStoragePath(
    payload.logo_url,
    "imagenes-negocios",
  );
  const nextBannerPath = extractStoragePath(
    payload.banner_url,
    "imagenes-negocios",
  );

  if (previousLogoPath && previousLogoPath !== nextLogoPath) {
    brandingFilesToRemove.push(previousLogoPath);
  }

  if (previousBannerPath && previousBannerPath !== nextBannerPath) {
    brandingFilesToRemove.push(previousBannerPath);
  }

  if (brandingFilesToRemove.length > 0) {
    const { error: removeError } = await supabaseAdmin.storage
      .from("imagenes-negocios")
      .remove(brandingFilesToRemove);

    if (removeError) {
      console.error(
        `[NEO RECOVERY WARN]: Error purga branding anterior: ${removeError.message}`,
      );
    }
  }

  // Purga de cachés de Next.js App Router para renderizado inmediato en runtime
  revalidatePath("/configuracion");
  revalidatePath(`/${slugSaneado}`);

  return { success: true, slugSaneado };
}

/**
 * Purga de raíz un negocio, sus archivos multimedia físicos en Storage y su cascada relacional.
 */
export async function deleteTenantBrandingAction(id: string) {
  const supabase = await createClient();
  const BRANDING_BUCKET = "imagenes-negocios";
  const MEDIA_BUCKET = "media";

  // 1. Reaseguro estricto de identidad en sesión activa
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Acceso denegado. Terminal no autenticada.");
  }

  // 2. Consulta defensiva previa para capturar las URLs de los assets antes de eliminarlos
  const { data: negocio, error: fetchError } = await supabase
    .from("negocios")
    .select("logo_url, banner_url, slug")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !negocio) {
    throw new Error(
      "No se pudo localizar el comercio o no posees los permisos necesarios.",
    );
  }

  // 3. Obtener productos para borrar sus imágenes en Storage
  const { data: productos } = await supabase
    .from("productos")
    .select("imagen_url")
    .eq("negocio_id", id);

  const mediaPathsToPurge: string[] = [];
  if (productos) {
    for (const prod of productos) {
      const path = extractStoragePath(prod.imagen_url, MEDIA_BUCKET);
      if (path) mediaPathsToPurge.push(path);
    }
  }

  // 4. Analizar y preparar el array de archivos de identidad a remover
  const brandingPathsToPurge: string[] = [];
  const logoPath = extractStoragePath(negocio.logo_url, BRANDING_BUCKET);
  const bannerPath = extractStoragePath(negocio.banner_url, BRANDING_BUCKET);

  if (logoPath) brandingPathsToPurge.push(logoPath);
  if (bannerPath) brandingPathsToPurge.push(bannerPath);

  // 5. Purga en bloque de Cloud Storage (Productos + Identidad)
  if (mediaPathsToPurge.length > 0) {
    const { error: mediaStorageError } = await supabaseAdmin.storage
      .from(MEDIA_BUCKET)
      .remove(mediaPathsToPurge);
    if (mediaStorageError) {
      console.error(
        `[NEO RECOVERY WARN]: Error purga media: ${mediaStorageError.message}`,
      );
    }
  }

  if (brandingPathsToPurge.length > 0) {
    const { error: brandingStorageError } = await supabaseAdmin.storage
      .from(BRANDING_BUCKET)
      .remove(brandingPathsToPurge);
    if (brandingStorageError) {
      console.error(
        `[NEO RECOVERY WARN]: Error purga branding: ${brandingStorageError.message}`,
      );
    }
  }

  // 6. Purga Manual en Cascada de Base de Datos para asegurar borrado absoluto sin depender de FK constraints
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("id")
    .eq("negocio_id", id);
  if (pedidos && pedidos.length > 0) {
    const pedidoIds = pedidos.map((p) => p.id);
    await supabase.from("pedido_items").delete().in("pedido_id", pedidoIds);
  }

  await supabase.from("pedidos").delete().eq("negocio_id", id);
  await supabase.from("clientes").delete().eq("negocio_id", id);
  await supabase.from("productos").delete().eq("negocio_id", id);
  await supabase.from("categorias").delete().eq("negocio_id", id);

  // 7. Operación destructiva final acotada al binomio id + user_id para blindar aislamiento total
  const { error: deleteError } = await supabase
    .from("negocios")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    throw new Error(
      `Fallo de consistencia Core al eliminar el negocio: ${deleteError.message}`,
    );
  }

  // 8. Eliminar la cuenta de usuario de auth de forma definitiva para evitar residuos y bloqueos de nuevo registro
  try {
    const { error: deleteUserError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      console.error(
        `[NEO RECOVERY WARN]: Error purga user Auth: ${deleteUserError.message}`,
      );
    }
  } catch (adminErr) {
    console.error(
      `[NEO RECOVERY WARN]: No se pudo instanciar supabaseAdmin para purgar usuario:`,
      adminErr,
    );
  }

  // 9. Invalidar las rutas del frontend
  revalidatePath("/configuracion");
  revalidatePath(`/${negocio.slug}`);

  return { success: true };
}
