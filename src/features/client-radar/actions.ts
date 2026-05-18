"use server";

import { createClient } from "@/core/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Helper privado para asegurar el aislamiento Multi-tenant en el servidor.
 */
async function getValidatedTenantId(supabase: any) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Acceso denegado. Sesión inválida.");

  const { data: negocio, error: tenantError } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (tenantError || !negocio)
    throw new Error("Inconsistencia: No se detectó un negocio asignado.");
  return negocio.id;
}

/**
 * Actualiza las anotaciones de auditoría o historial del cliente en la columna 'notas'.
 */
export async function updateClientSystemNotes(
  clienteId: string,
  nuevasNotas: string,
) {
  const supabase = await createClient();
  const tenantId = await getValidatedTenantId(supabase);

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
  const tenantId = await getValidatedTenantId(supabase);

  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", clienteId)
    .eq("negocio_id", tenantId);

  if (error) throw new Error(`No se pudo remover el cliente: ${error.message}`);

  revalidatePath("/clientes");
  return { success: true };
}
