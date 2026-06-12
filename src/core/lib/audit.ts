import { supabaseAdmin } from "@/core/lib/supabase/admin";

type AuditAccion = "create" | "update" | "delete";
type AuditEntidad =
  | "producto"
  | "categoria"
  | "pedido"
  | "negocio"
  | "configuracion"
  | "cliente";

export async function logAuditEvent(params: {
  negocio_id: string;
  user_id: string;
  accion: AuditAccion;
  entidad: AuditEntidad;
  entidad_id?: string;
  cambios_previos?: Record<string, unknown> | null;
  cambios_nuevos?: Record<string, unknown> | null;
  ip_address?: string;
}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabaseAdmin.from("audit_logs" as any) as any).insert({
      negocio_id: params.negocio_id,
      user_id: params.user_id,
      accion: params.accion,
      entidad: params.entidad,
      entidad_id: params.entidad_id ?? null,
      cambios_previos: params.cambios_previos ?? null,
      cambios_nuevos: params.cambios_nuevos ?? null,
      ip_address: params.ip_address ?? null,
    });
  } catch {
    // audit logging never blocks the main flow
  }
}
