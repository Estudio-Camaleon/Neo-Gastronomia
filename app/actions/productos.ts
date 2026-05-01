"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function crearProducto(formData: any, negocioId: string) {
  const { nombre, precio, categoriaId, imagen_url, descripcion } = formData;

  const { data, error } = await supabaseAdmin.from("productos").insert({
    nombre,
    precio: parseFloat(precio),
    categoria_id: categoriaId, // Usamos el ID normalizado
    negocio_id: negocioId,
    imagen_url,
    descripcion,
    disponible: true,
  });

  if (error) {
    console.error("Error al crear producto:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/productos");
  return { success: true };
}
