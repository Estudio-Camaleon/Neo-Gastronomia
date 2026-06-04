"use server";

import { createClient } from "@/core/lib/supabase/server";
import { supabaseAdmin } from "@/core/lib/supabase/admin";
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

  const { data: pedidos, error: pedidoError } = await supabaseAdmin
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
    .limit(1);

  const pedido = pedidos?.[0] ?? null;
  if (pedidoError || !pedido) {
    throw new Error(
      pedidoError?.message || "Fallo crítico al inicializar la orden.",
    );
  }

  // Crear o actualizar cliente por teléfono (no por nombre)
  const clienteTelefono = parsed.data.cliente_whatsapp.trim();
  const { data: clientesEncontrados } = await supabaseAdmin
    .from("clientes")
    .select("id")
    .eq("negocio_id", parsed.data.negocio_id)
    .eq("telefono", clienteTelefono)
    .limit(1);

  const clienteExistente = clientesEncontrados?.[0] ?? null;

  if (clienteExistente) {
    await supabaseAdmin
      .from("clientes")
      .update({
        nombre: parsed.data.cliente_nombre.trim(),
        direccion: parsed.data.direccion_entrega?.trim() ?? null,
      })
      .eq("id", clienteExistente.id);
  } else {
    await supabaseAdmin.from("clientes").insert({
      negocio_id: parsed.data.negocio_id,
      nombre: parsed.data.cliente_nombre.trim(),
      telefono: clienteTelefono,
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

  const { error: itemsError } = await supabaseAdmin
    .from("pedido_items")
    .insert(itemsPayload);

  if (itemsError)
    throw new Error(
      `Fallo al ensamblar comanda interna: ${itemsError.message}`,
    );

  return pedido.id;
}
