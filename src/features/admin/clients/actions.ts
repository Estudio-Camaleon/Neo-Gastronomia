"use server";

import { createClient } from "@/core/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedTenant } from "@/core/lib/tenant";

/**
 * Actualiza las anotaciones de auditoría o historial del cliente en la columna 'notas'.
 */
export async function updateClientSystemNotes(
  clienteId: string,
  nuevasNotas: string,
) {
  const supabase = await createClient();
  const tenantId = await getAuthenticatedTenant(supabase);

  // Mutación protegida asegurando que el cliente pertenezca al scope del negocio
  const { error } = await supabase
    .from("clientes")
    .update({ notas: nuevasNotas.trim() })
    .eq("id", clienteId)
    .eq("negocio_id", tenantId);

  if (error) throw new Error(`Fallo de persistencia: ${error.message}`);

  revalidatePath("/clientes");
  return { success: true };
}

/**
 * Elimina un registro de cliente de la base de datos del tenant de forma segura.
 */
export async function deleteClientAction(clienteId: string) {
  const supabase = await createClient();
  const tenantId = await getAuthenticatedTenant(supabase);

  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", clienteId)
    .eq("negocio_id", tenantId);

  if (error) throw new Error(`No se pudo remover el cliente: ${error.message}`);

  revalidatePath("/clientes");
  return { success: true };
}
