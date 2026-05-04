"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * ACTUALIZAR CONFIGURACIÓN DEL NEGOCIO
 * Maneja la información general y la configuración visual (colores, estados, etc.)
 */
export async function actualizarNegocio(negocioId: string, data: any) {
  const supabase = await createClient();

  // Verificación de sesión para asegurar que solo el dueño edite su negocio
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const { error } = await supabase
    .from("negocios")
    .update({
      nombre: data.nombre,
      slug: data.slug, // El slug es vital para la URL pública
      telefono_whatsapp: data.telefono,
      direccion: data.direccion,
      configuracion: data.configuracion, // Objeto JSON con estilos y horarios
    })
    .eq("id", negocioId)
    .eq("user_id", user.id); // Doble validación de seguridad

  if (error) {
    console.error("Error al actualizar negocio:", error.message);
    return { success: false, error: "Error al guardar los cambios." };
  }

  // Revalidamos las rutas clave para que los cambios visuales se apliquen
  revalidatePath("/(adminPanel)/configuracion", "page");
  revalidatePath(`/(public)/${data.slug}`, "page");

  return { success: true };
}

/**
 * OBTENER DATOS DEL NEGOCIO (Server-side)
 * Útil para cargar la configuración inicial en formularios
 */
export async function getNegocioData(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("negocios")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
