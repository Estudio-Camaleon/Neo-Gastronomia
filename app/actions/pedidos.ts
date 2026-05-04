"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Registra un nuevo pedido en la base de datos.
 * @param negocioId UUID del negocio
 * @param datosPedido Objeto con info del cliente, total e items (JSONB)
 */
export async function crearPedido(negocioId: string, datosPedido: any) {
  const supabase = await createClient();

  // Insertamos en la tabla 'pedidos'
  // Nota: Estamos guardando los items como un campo JSONB para mayor agilidad
  const { data, error } = await supabase
    .from("pedidos")
    .insert([
      {
        negocio_id: negocioId,
        cliente_nombre: datosPedido.nombre,
        cliente_whatsapp: datosPedido.whatsapp || null,
        direccion_entrega: datosPedido.direccion,
        total: datosPedido.total,
        items: datosPedido.items, // Array de productos del CartContext
        metodo_pago: datosPedido.metodoPago || "Efectivo",
        estado: "pendiente",
        notas: datosPedido.notas || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error Supabase:", error.message);
    return { success: false, error: error.message };
  }

  // Refrescamos la ruta del admin para que el nuevo pedido aparezca vía SSR o Realtime
  revalidatePath("/(adminPanel)/pedidos");

  return { success: true, data };
}
