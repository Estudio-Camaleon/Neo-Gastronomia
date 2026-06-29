"use server";

import { createClient } from "@/core/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { parseStorageUrl } from "@/core/lib/tenant";
import { supabaseAdmin } from "@/core/lib/supabase/admin";
import { generateSlug } from "@/core/lib/slug";
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

  const slugSaneado = generateSlug(payload.slug);

  if (slugSaneado.length < 3) {
    throw new Error("El identificador URL (Slug) es demasiado corto.");
  }

  // Actualización plana mapeada milimétricamente a la tabla public.negocios
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("negocios") as any)
    .update({
      nombre: payload.nombre.trim(),
      slug: slugSaneado,
      whatsapp: payload.whatsapp.trim(),
      descripcion: payload.descripcion.trim(),
      direccion: payload.direccion.trim(),
      localidad: payload.localidad.trim(),
      direccion_notas: payload.direccion_notas.trim(),
      color_primary: payload.color_primary,
      logo_url: payload.logo_url,
      logo_scale: payload.logo_scale,
      logo_posicion: payload.logo_posicion,
      logo_fit: payload.logo_fit,
      logo_shape: payload.logo_shape,
      banner_url: payload.banner_url,
      banner_posicion: payload.banner_posicion,
      banner_height: payload.banner_height,
      banner_scale: payload.banner_scale,
      mostrar_nombre: payload.mostrar_nombre,
      instagram_url: payload.instagram_url.trim(),
      facebook_url: payload.facebook_url.trim(),
      tiktok_url: payload.tiktok_url.trim(),
      twitter_url: payload.twitter_url.trim(),
      youtube_url: payload.youtube_url.trim(),
      horarios: payload.horarios as Json,
      direcciones: payload.direcciones as unknown as Json,
      whatsapp_mensajes: payload.whatsapp_mensajes as unknown as Json,
      tipo_envio: payload.tipo_envio,
      costo_envio: payload.costo_envio,
      pedido_minimo: payload.pedido_minimo,
      moneda_simbolo: payload.moneda_simbolo,
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

  const brandingFilesToRemove: Array<{ bucket: string; path: string }> = [];
  const prevLogo = parseStorageUrl(negocioActual.logo_url);
  const prevBanner = parseStorageUrl(negocioActual.banner_url);
  const nextLogo = parseStorageUrl(payload.logo_url);
  const nextBanner = parseStorageUrl(payload.banner_url);

  if (prevLogo && (!nextLogo || prevLogo.path !== nextLogo.path)) {
    brandingFilesToRemove.push(prevLogo);
  }

  if (prevBanner && (!nextBanner || prevBanner.path !== nextBanner.path)) {
    brandingFilesToRemove.push(prevBanner);
  }

  for (const { bucket, path } of brandingFilesToRemove) {
    const { error: removeError } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);
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
export async function deleteTenantBrandingAction(id: string, reason?: string) {
  const supabase = await createClient();

  // 1. Reaseguro estricto de identidad en sesión activa
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Acceso denegado. Terminal no autenticada.");
  }

  // 1b. Guardar el motivo de baja antes de purgar
  if (reason) {
    await supabase
      .from("negocios")
      .update({ deletion_reason: reason })
      .eq("id", id)
      .eq("user_id", user.id);
  }

  // 2. Consulta defensiva previa para capturar las URLs de los assets antes de eliminarlos
  const { data: negocios } = await supabase
    .from("negocios")
    .select("logo_url, banner_url, slug")
    .eq("id", id)
    .eq("user_id", user.id)
    .limit(1);

  const negocio = negocios?.[0] ?? null;
  if (!negocio) {
    throw new Error(
      "No se pudo localizar el comercio o no posees los permisos necesarios.",
    );
  }

  // 3. Obtener productos para borrar sus imágenes en Storage
  const { data: productos } = await supabase
    .from("productos")
    .select("imagen_url")
    .eq("negocio_id", id);

  const storagePathsToPurge: Array<{ bucket: string; path: string }> = [];
  if (productos) {
    for (const prod of productos) {
      const parsed = parseStorageUrl(prod.imagen_url);
      if (parsed) storagePathsToPurge.push(parsed);
    }
  }

  // 4. Analizar y preparar el array de archivos de identidad a remover
  const logo = parseStorageUrl(negocio.logo_url);
  const banner = parseStorageUrl(negocio.banner_url);
  if (logo) storagePathsToPurge.push(logo);
  if (banner) storagePathsToPurge.push(banner);

  // 5. Purga en bloque de Cloud Storage (por bucket agrupado para optimizar)
  const byBucket = new Map<string, string[]>();
  for (const { bucket, path } of storagePathsToPurge) {
    const arr = byBucket.get(bucket);
    if (arr) arr.push(path);
    else byBucket.set(bucket, [path]);
  }
  for (const [bucket, paths] of byBucket) {
    const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);
    if (error) {
      console.error(
        `[NEO RECOVERY WARN]: Error purga storage (${bucket}): ${error.message}`,
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

  // 8. Eliminar la cuenta de usuario de auth — va al final para evitar FK (user_id → auth.users)
  const { error: deleteUserError } =
    await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (deleteUserError) {
    console.error(
      `[NEO RECOVERY WARN]: No se pudo purgar la cuenta de acceso: ${deleteUserError.message}.`,
    );
  }

  // 9. Invalidar las rutas del frontend
  revalidatePath("/configuracion");
  revalidatePath(`/${negocio.slug}`);

  return { success: true };
}
