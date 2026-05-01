"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Actualiza la configuración del negocio incluyendo la subida física del logo.
 * Aplica lógica de sobrescritura para mantener el Storage optimizado.
 */
export async function updateNegocioConfig(formData: FormData) {
  const supabase = await createClient();

  // 1. Verificación de Seguridad
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Sesión no válida o expirada." };
  }

  const logoFile = formData.get("logo_file") as File;
  let logoUrl = "";

  // 2. Lógica de Storage (Imagen física)
  // Validamos que el archivo sea una imagen real y tenga contenido
  if (logoFile && logoFile.size > 0 && logoFile.type.startsWith("image/")) {
    const fileExt = logoFile.name.split(".").pop();
    // Usamos una ruta fija por usuario para que el nuevo logo reemplace al anterior físicamente
    const filePath = `${user.id}/logo-principal.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("logos")
      .upload(filePath, logoFile, {
        upsert: true,
        contentType: logoFile.type,
      });

    if (uploadError) {
      console.error("Storage Error:", uploadError.message);
      return {
        success: false,
        error: "No se pudo procesar la imagen del logo.",
      };
    }

    // Obtenemos la URL final para guardarla en la tabla negocios
    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(filePath);

    logoUrl = publicUrl;
  }

  // 3. Procesamiento de datos fragmentados (WhatsApp y Horarios)
  // Limpiamos los inputs para evitar caracteres extraños
  const phoneCode = formData.get("phone_code") || "54";
  const phoneNumber = (formData.get("whatsapp_number") as string).replace(
    /\D/g,
    "",
  );
  const fullPhone = `${phoneCode}${phoneNumber}`;

  const apertura = `${formData.get("h_apertura")}:${formData.get("m_apertura")}`;
  const cierre = `${formData.get("h_cierre")}:${formData.get("m_cierre")}`;

  // Preparamos el objeto de actualización
  const updateData: any = {
    color_primario: formData.get("color_primario") || "#E60000",
    whatsapp: fullPhone,
    direccion: formData.get("direccion") || "",
    horarios_apertura: apertura,
    horarios_cierre: cierre,
  };

  // Solo actualizamos la URL del logo si el usuario subió un archivo nuevo
  if (logoUrl) {
    updateData.logo_url = logoUrl;
  }

  // 4. Actualización en Base de Datos
  const { error: dbError } = await supabase
    .from("negocios")
    .update(updateData)
    .eq("user_id", user.id);

  if (dbError) {
    console.error("Database Error:", dbError.message);
    return { success: false, error: "Error al guardar en la base de datos." };
  }

  // 5. Refresco de Caché
  // Esto asegura que el cliente de MacDonals vea el cambio al instante
  revalidatePath("/", "layout");

  return { success: true };
}
