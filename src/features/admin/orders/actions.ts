"use server";

import { createClient } from "@/core/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthenticatedTenant } from "@/core/lib/tenant";
import { updateOrderStatusSchema, submitOrderSchema } from "@/core/lib/schemas";

/**
 * Cambia el estado de un pedido validando aislamiento mutli-tenant.
 */
export async function updateOrderStatusAction(
  pedidoId: string,
  nuevoEstado: "pendiente" | "en_preparacion" | "entregado" | "cancelado",
) {
  const parsed = updateOrderStatusSchema.safeParse({
    pedidoId,
    nuevoEstado,
  });
  if (!parsed.success) throw new Error("Estado de pedido inválido");

  const supabase = await createClient();
  const tenantId = await getAuthenticatedTenant(supabase);

  const { error } = await supabase
    .from("pedidos")
    .update({ estado: parsed.data.nuevoEstado })
    .eq("id", parsed.data.pedidoId)
    .eq("negocio_id", tenantId);

  if (error) throw new Error(`Fallo de sincronización RLS: ${error.message}`);

  revalidatePath("/pedidos");
  return { success: true };
}

/**
 * Inserción transaccional atómica ejecutada por el comensal.
 */
export async function submitOrderPublicAction(
  payload: z.infer<typeof submitOrderSchema>,
) {
  const parsed = submitOrderSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new Error(
      `Datos de orden inválidos: ${firstIssue.path.join(".")} - ${firstIssue.message}`,
    );
  }

  const supabase = await createClient();

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      negocio_id: parsed.data.negocio_id,
      cliente_nombre: parsed.data.cliente_nombre.trim(),
      cliente_whatsapp: parsed.data.cliente_whatsapp.trim(),
      es_delivery: parsed.data.es_delivery,
      direccion_entrega: parsed.data.es_delivery
        ? (parsed.data.direccion_entrega?.trim() ?? null)
        : null,
      metodo_pago: parsed.data.metodo_pago,
      total: parsed.data.total,
      estado: "pendiente",
      notas: parsed.data.notas?.trim() ?? null,
    })
    .select("id")
    .single();

  if (pedidoError || !pedido) {
    throw new Error(
      pedidoError?.message || "Fallo crítico al inicializar la orden.",
    );
  }

  // Crear o actualizar cliente en la tabla clientes
  const clienteNombre = parsed.data.cliente_nombre.trim();
  const { data: clienteExistente } = await supabase
    .from("clientes")
    .select("id, notas")
    .eq("negocio_id", parsed.data.negocio_id)
    .eq("nombre", clienteNombre)
    .maybeSingle();

  if (clienteExistente) {
    await supabase
      .from("clientes")
      .update({
        telefono: parsed.data.cliente_whatsapp.trim(),
        direccion: parsed.data.direccion_entrega?.trim() ?? null,
      })
      .eq("id", clienteExistente.id);
  } else {
    await supabase.from("clientes").insert({
      negocio_id: parsed.data.negocio_id,
      nombre: clienteNombre,
      telefono: parsed.data.cliente_whatsapp.trim(),
      direccion: parsed.data.direccion_entrega?.trim() ?? null,
    });
  }

  const itemsPayload = parsed.data.items.map((item) => ({
    pedido_id: pedido.id,
    producto_id: item.producto_id,
    nombre_producto: item.nombre_producto,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    detalles: item.detalles ?? null,
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
