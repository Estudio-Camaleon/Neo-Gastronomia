"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Genera un slug simple para la categoría.
 * Ejemplo: "Pizzas Especiales" -> "pizzas-especiales"
 */
const generateSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Reemplaza espacios por guiones
    .replace(/[^\w\-]+/g, "") // Elimina caracteres no alfanuméricos
    .replace(/\-\-+/g, "-"); // Elimina guiones dobles
};

export async function crearCategoria(negocioId: string, nombre: string) {
  const supabase = await createClient();

  const slug = generateSlug(nombre);

  const { error } = await supabase.from("categorias").insert([
    {
      negocio_id: negocioId,
      nombre: nombre.toUpperCase().trim(),
      slug: slug,
    },
  ]);

  if (error) {
    console.error("Error en DB (Categorias):", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/(adminPanel)/productos");
  return { success: true };
}

export async function eliminarCategoria(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("categorias").delete().eq("id", id);

  if (error) {
    console.error("Error al eliminar categoría:", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/(adminPanel)/productos");
  return { success: true };
}
