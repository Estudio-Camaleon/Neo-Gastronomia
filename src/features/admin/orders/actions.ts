"use server";

import { createClient } from "@/core/lib/supabase/server";
import { supabaseAdmin } from "@/core/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthenticatedTenant } from "@/core/lib/tenant";
import { updateOrderStatusSchema, submitOrderSchema } from "@/core/lib/schemas";
import { logAuditEvent } from "@/core/lib/audit";

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
  const { user } = (await supabase.auth.getUser()).data;
  const tenantId = await getAuthenticatedTenant(supabase);

  const { data: old } = await supabase
    .from("pedidos")
    .select("estado")
    .eq("id", parsed.data.pedidoId)
    .limit(1)
    .single();

  const { error } = await supabase
    .from("pedidos")
    .update({ estado: parsed.data.nuevoEstado })
    .eq("id", parsed.data.pedidoId)
    .eq("negocio_id", tenantId);

  if (error) throw new Error(`Fallo de sincronización RLS: ${error.message}`);

  logAuditEvent({
    negocio_id: tenantId,
    user_id: user?.id ?? "",
    accion: "update",
    entidad: "pedido",
    entidad_id: parsed.data.pedidoId,
    cambios_previos: old ?? undefined,
    cambios_nuevos: { estado: parsed.data.nuevoEstado },
  });

  revalidatePath("/pedidos");
  return { success: true };
}

/**
 * Inserción transaccional atómica ejecutada por el comensal.
 *
 * Delega en el RPC `submit_order_atomic` (Supabase/Postgres) que:
 * - Valida que cada producto exista y pertenezca al negocio
 * - Toma precio/nombre de la DB (el server es la autoridad)
 * - Suma extras del JSON de `detalles` para el precio real
 * - UPSERT del cliente por (negocio_id, telefono) en una sola pasada
 * - Setea `cliente_id` en el pedido
 * - Computa y persiste el total server-side
 *
 * El cliente solo envía { producto_id, cantidad, detalles }.
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

  const itemsJson = parsed.data.items.map((item) => ({
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    detalles: item.detalles ?? null,
  }));

  const { data: pedidoId, error } = await supabaseAdmin.rpc(
    "submit_order_atomic",
    {
      p_negocio_id: parsed.data.negocio_id,
      p_cliente_nombre: parsed.data.cliente_nombre,
      p_cliente_whatsapp: parsed.data.cliente_whatsapp,
      p_es_delivery: parsed.data.es_delivery,
      p_direccion_entrega:
        parsed.data.es_delivery && parsed.data.direccion_entrega
          ? parsed.data.direccion_entrega
          : "",
      p_metodo_pago: parsed.data.metodo_pago,
      p_notas: parsed.data.notas ?? "",
      p_items: itemsJson,
    },
  );

  if (error || !pedidoId) {
    throw new Error(
      "No pudimos procesar tu pedido. Intentá de nuevo en unos minutos.",
    );
  }

  return pedidoId as string;
}
