"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function guardarProducto(
  negocioId: string,
  data: any,
  productoId?: string,
) {
  const supabase = await createClient();

  const payload = {
    negocio_id: negocioId,
    nombre: data.nombre,
    descripcion: data.descripcion,
    precio: parseFloat(data.precio),
    imagen_url: data.imagen_url,
    categoria_id: data.categoria_id || null,
    disponible: data.disponible,
  };

  if (productoId) {
    // Actualizar producto existente
    const { error } = await supabase
      .from("productos")
      .update(payload)
      .eq("id", productoId);
    if (error) return { success: false, error: error.message };
  } else {
    // Insertar nuevo producto
    const { error } = await supabase.from("productos").insert([payload]);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/(adminPanel)/productos");
  return { success: true };
}
