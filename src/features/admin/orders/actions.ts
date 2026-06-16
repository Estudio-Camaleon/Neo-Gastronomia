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

  // Verificar que la recepción no esté pausada
  const { data: negocio } = await supabaseAdmin
    .from("negocios")
    .select("recepcion_pausada")
    .eq("id", parsed.data.negocio_id)
    .limit(1)
    .single();

  if (negocio?.recepcion_pausada) {
    throw new Error(
      "La recepción de pedidos está pausada. El local no está aceptando pedidos en este momento.",
    );
  }

  const itemsJson = parsed.data.items.map((item) => ({
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    detalles: item.detalles ?? null,
  }));

  const { data, error } = await supabaseAdmin.rpc(
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

  if (error) {
    const msg = error.message ?? JSON.stringify(error);
    throw new Error(`No pudimos procesar tu pedido: ${msg}`);
  }

  const pedidoId = typeof data === "string" ? data : null;
  if (!pedidoId) {
    throw new Error(
      "No se obtuvo respuesta del servicio de pedidos. Intenta de nuevo más tarde.",
    );
  }

  return pedidoId;
}

/**
 * Activa/desactiva la recepción pausada (panic mode) para el negocio autenticado.
 */
export async function toggleRecepcionPausadaAction() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Acceso denegado");

  // Leer estado actual
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, recepcion_pausada")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!negocio) throw new Error("No se encontró el negocio");

  const nuevoEstado = !negocio.recepcion_pausada;

  const { error } = await supabase
    .from("negocios")
    .update({ recepcion_pausada: nuevoEstado, updated_at: new Date().toISOString() })
    .eq("id", negocio.id);

  if (error) throw new Error(`Error al actualizar: ${error.message}`);

  revalidatePath("/pedidos");
  revalidatePath(`/${(await supabase.from("negocios").select("slug").eq("id", negocio.id).limit(1).single()).data?.slug}`);

  return { success: true, recepcion_pausada: nuevoEstado };
}
