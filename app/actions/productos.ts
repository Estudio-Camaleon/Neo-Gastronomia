"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * CREAR PRODUCTO
 * Usa el puerto 6543 (Pooler) automáticamente desde el servidor.
 */
export async function crearProducto(data: any, negocioId: string) {
  const supabase = await createClient();

  // Verificación de seguridad extra en el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sesión expirada o no válida" };

  const { error } = await supabase.from("productos").insert([
    {
      nombre: data.nombre,
      precio: parseFloat(data.precio),
      descripcion: data.descripcion,
      categoria_id: data.categoriaId,
      negocio_id: negocioId,
      disponible: true,
    },
  ]);

  if (error) {
    console.error("Error CRUD (Create):", error.message);
    return { success: false, error: "No se pudo guardar el producto." };
  }

  // Limpiamos caché para que el cambio sea instantáneo en el panel
  revalidatePath("/(adminPanel)/productos", "page");
  return { success: true };
}

/**
 * ACTUALIZAR DISPONIBILIDAD (Optimistic)
 */
export async function updateProductAvailability(
  id: string,
  disponible: boolean,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("productos")
    .update({ disponible })
    .eq("id", id);

  if (error) {
    console.error("Error CRUD (Update Status):", error.message);
    return { success: false, error: error.message };
  }

  // Revalidamos para asegurar consistencia entre dispositivos
  revalidatePath("/(adminPanel)/productos", "page");
  return { success: true };
}

/**
 * ELIMINAR PRODUCTO
 */
export async function eliminarProducto(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("productos").delete().eq("id", id);

  if (error) {
    console.error("Error CRUD (Delete):", error.message);
    return { success: false, error: "Error al eliminar el registro." };
  }

  revalidatePath("/(adminPanel)/productos", "page");
  return { success: true };
}

/**
 * EDITAR PRODUCTO COMPLETO
 */
export async function editarProducto(id: string, data: any) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("productos")
    .update({
      nombre: data.nombre,
      precio: parseFloat(data.precio),
      descripcion: data.descripcion,
      categoria_id: data.categoriaId,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/(adminPanel)/productos", "page");
  return { success: true };
}
