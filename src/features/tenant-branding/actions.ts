"use server";

import { createClient } from "@/core/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UpdateTenantBrandingPayload {
  id: string;
  nombre: string;
  slug: string;
  whatsapp: string;
  direccion: string;
  localidad: string;
  direccion_notas: string;
  color_primary: string;
  logo_url: string;
  banner_url: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  horarios: Record<string, unknown>;
}

/**
 * Pone al día la identidad corporativa de un negocio mitigando escaladas RLS.
 */
export async function updateTenantBrandingAction(
  payload: UpdateTenantBrandingPayload,
) {
  const supabase = await createClient();

  // Reaseguro de Identidad: Validar que el usuario en sesión sea el propietario real
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Acceso denegado. Terminal no autenticada.");
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
      horarios: payload.horarios,
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

  // Purga de cachés de Next.js App Router para renderizado inmediato en runtime
  revalidatePath("/configuracion");
  revalidatePath(`/${slugSaneado}`);

  return { success: true, slugSaneado };
}

/**
 * Extrae de forma quirúrgica el path relativo interno de una URL pública de Supabase Storage.
 * Ejemplo: de https://.../public/imagenes-negocios/identidad/file.png extrae identidad/file.png
 */
function extractStoragePath(
  url: string | null | undefined,
  bucketName: string,
): string | null {
  if (!url || url.trim() === "") return null;
  const marker = `/public/${bucketName}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.substring(index + marker.length);
}

/**
 * Purga de raíz un negocio, sus archivos multimedia físicos en Storage y su cascada relacional.
 */
export async function deleteTenantBrandingAction(id: string) {
  const supabase = await createClient();
  const BUCKET_NAME = "imagenes-negocios";

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

  // 3. Analizar y preparar el array de archivos físicos a remover
  const pathsToPurge: string[] = [];
  const logoPath = extractStoragePath(negocio.logo_url, BUCKET_NAME);
  const bannerPath = extractStoragePath(negocio.banner_url, BUCKET_NAME);

  if (logoPath) pathsToPurge.push(logoPath);
  if (bannerPath) pathsToPurge.push(bannerPath);

  // 4. Si existen archivos en Cloud Storage, disparar la purga en bloque
  if (pathsToPurge.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(pathsToPurge);

    // Hacemos un log defensivo en consola, pero no bloqueamos la baja de la base de datos si falla el storage
    if (storageError) {
      console.error(
        `[NEO RECOVERY WARN]: No se pudieron purgar ciertos archivos en storage: ${storageError.message}`,
      );
    }
  }

  // 5. Operación destructiva final acotada al binomio id + user_id para blindar aislamiento total
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

  // 6. Invalidar las rutas del frontend para evitar visualización de datos fantasmas cacheados
  revalidatePath("/configuracion");
  revalidatePath(`/${negocio.slug}`);

  return { success: true };
}
