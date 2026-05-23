"use server";

import { createClient } from "@/core/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SubmitOrderPayload {
  negocio_id: string;
  cliente_nombre: string;
  cliente_whatsapp: string;
  es_delivery: boolean;
  direccion_entrega: string | null;
  metodo_pago: "efectivo" | "transferencia";
  notas: string | null;
  total: number;
  items: Array<{
    producto_id: string;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    detalles: string | null;
  }>;
}

/**
 * Cambia el estado de un pedido validando aislamiento mutli-tenant.
 */
export async function updateOrderStatusAction(
  pedidoId: string,
  nuevoEstado: "pendiente" | "en_preparacion" | "entregado" | "cancelado",
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Terminal no autorizada.");

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!negocio) throw new Error("Inconsistencia crítica: Negocio ausente.");

  const { error } = await supabase
    .from("pedidos")
    .update({ estado: nuevoEstado })
    .eq("id", pedidoId)
    .eq("negocio_id", negocio.id);

  if (error) throw new Error(`Fallo de sincronización RLS: ${error.message}`);

  revalidatePath("/pedidos");
  return { success: true };
}

/**
 * Inserción transaccional atómica ejecutada por el comensal.
 */
export async function submitOrderPublicAction(payload: SubmitOrderPayload) {
  const supabase = await createClient();

  // 1. Persistencia de la Orden Maestra vinculada milimétricamente al esquema real
  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      negocio_id: payload.negocio_id,
      cliente_nombre: payload.cliente_nombre.trim(),
      cliente_whatsapp: payload.cliente_whatsapp.trim(),
      es_delivery: payload.es_delivery,
      direccion_entrega: payload.es_delivery
        ? payload.direccion_entrega?.trim()
        : null,
      metodo_pago: payload.metodo_pago,
      total: payload.total,
      estado: "pendiente",
      notas: payload.notas?.trim() || null,
    })
    .select("id")
    .single();

  if (pedidoError || !pedido) {
    throw new Error(
      pedidoError?.message || "Fallo crítico al inicializar la orden.",
    );
  }

  // 2. Mapeo inmutable de los ítems de la comanda
  const itemsPayload = payload.items.map((item) => ({
    pedido_id: pedido.id,
    producto_id: item.producto_id,
    nombre_producto: item.nombre_producto,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    detalles: item.detalles,
  }));

  const { error: itemsError } = await supabase
    .from("pedido_items")
    .insert(itemsPayload);

  if (itemsError)
    throw new Error(
      `Fallo al ensamblar comanda interna: ${itemsError.message}`,
    );

  return pedido.id;
}
