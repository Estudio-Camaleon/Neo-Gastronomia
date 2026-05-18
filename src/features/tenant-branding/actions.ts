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
  horarios: Record<string, any>;
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
  if (authError || !user)
    throw new Error("Acceso denegado. Terminal no autenticada.");

  // Sanitización determinista del identificador web para URLs públicas
  const slugSaneado = payload.slug
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (slugSaneado.length < 3)
    throw new Error("El identificador URL (Slug) es demasiado corto.");

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
    .eq("user_id", user.id); // Doble candado Multi-tenant

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
