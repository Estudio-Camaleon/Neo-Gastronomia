"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Interfaz estricta para el tipado de la configuración (Horarios, colores, etc.)
interface ConfiguracionNegocio {
  color_primary?: string;
  color_dark?: string;
  horarios?: Record<string, unknown>;
  [key: string]: unknown; // Permite expandir el JSON de forma segura
}

// Interfaz para el parámetro de entrada 'data' que elimina el error de 'any'
interface ActualizarNegocioInput {
  nombre: string;
  slug: string;
  telefono: string;
  direccion: string;
  descripcion?: string | null; // Columna de branding integrada
  logo_url?: string | null; // URL del logo en Supabase Storage
  banner_url?: string | null; // URL del banner en Supabase Storage
  configuracion: ConfiguracionNegocio;
}

interface ActionResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * ACTUALIZAR CONFIGURACIÓN DEL NEGOCIO
 * Maneja la información general y la configuración visual (colores, estados, etc.)
 */
export async function actualizarNegocio(
  negocioId: string,
  data: ActualizarNegocioInput,
): Promise<ActionResponse> {
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
      descripcion: data.descripcion || null, // Guardamos la descripción
      banner_url: data.banner_url || null, // Guardamos el banner en DB
      configuracion: data.configuracion, // Objeto JSON con estilos y horarios
    })
    .eq("id", negocioId)
    .eq("user_id", user.id); // Doble validación de seguridad

  if (error) {
    console.error("Error al actualizar negocio:", error.message);
    return { success: false, error: "Error al guardar los cambios." };
  }

  // Revalidamos las rutas clave para que los cambios visuales se apliquen al instante
  revalidatePath("/(adminPanel)/configuracion", "page");
  revalidatePath(`/(menuPublic)/${data.slug}`, "page");

  return { success: true };
}

/**
 * OBTENER DATOS DEL NEGOCIO (Server-side)
 * Útil para cargar la configuración inicial en formularios
 */
export async function getNegocioData(userId: string): Promise<ActionResponse> {
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
