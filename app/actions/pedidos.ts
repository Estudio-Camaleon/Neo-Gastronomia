"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Actualiza el estado de un pedido (ej: de 'pendiente' a 'preparando').
 * Valida que el usuario autenticado sea el dueño del negocio asociado al pedido.
 */
export async function actualizarEstadoPedido(
  pedidoId: string,
  nuevoEstado: string,
) {
  const supabase = await createClient();

  // 1. Obtener el usuario actual
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      success: false,
      error: "No autorizado. Inicie sesión nuevamente.",
    };
  }

  try {
    // 2. Verificación de seguridad:
    // Aseguramos que el pedido pertenece a un negocio del usuario actual
    const { data: pedido, error: fetchError } = await supabase
      .from("pedidos")
      .select("negocio_id, negocios!inner(user_id)")
      .eq("id", pedidoId)
      .single();

    if (fetchError || !pedido) {
      return { success: false, error: "Pedido no encontrado." };
    }

    // @ts-ignore - Accedemos a la relación negocios vinculada por el inner join
    if (pedido.negocios.user_id !== user.id) {
      return { success: false, error: "No tienes permisos sobre este pedido." };
    }

    // 3. Ejecutar la actualización
    const { error: updateError } = await supabase
      .from("pedidos")
      .update({
        estado: nuevoEstado.toLowerCase(),
      })
      .eq("id", pedidoId);

    if (updateError) throw updateError;

    // 4. Revalidar la ruta para actualizar el radar y el historial
    revalidatePath("/(adminPanel)/pedidos");

    return {
      success: true,
      mensaje: `Pedido marcado como ${nuevoEstado.toUpperCase()}`,
    };
  } catch (err: any) {
    console.error("Critical Order Error:", err.message);
    return {
      success: false,
      error: "Error interno al procesar el cambio de estado.",
    };
  }
}

/**
 * Elimina o cancela un pedido del registro (Solo si el flujo de negocio lo permite).
 * Generalmente se prefiere cambiar el estado a 'cancelado', pero incluimos
 * la función por si necesitas una purga administrativa.
 */
export async function eliminarPedido(pedidoId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("pedidos").delete().eq("id", pedidoId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/(adminPanel)/pedidos");
  return { success: true };
}
