import { createClient } from "@/core/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAuthenticatedTenant(supabase?: SupabaseClient) {
  const client = supabase ?? (await createClient());

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();
  if (authError || !user) throw new Error("Acceso denegado. No autenticado.");

  const { data: negocios } = await client
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  const negocio = negocios?.[0] ?? null;
  if (!negocio)
    throw new Error("Inconsistencia Multi-tenant: Local no asignado.");

  return negocio.id;
}

export async function getAuthenticatedTenantWithUser(
  supabase?: Awaited<ReturnType<typeof createClient>>,
) {
  const client = supabase ?? (await createClient());

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user) {
    throw new Error("Acceso denegado. No autenticado.");
  }

  const { data: negocios } = await client
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  const negocio = negocios?.[0] ?? null;

  if (!negocio) {
    throw new Error("Inconsistencia Multi-tenant: Local no asignado.");
  }

  return { userId: user.id, negocioId: negocio.id };
}

export function extractStoragePath(
  url: string | null | undefined,
  bucketName: string,
): string | null {
  if (!url || url.trim() === "") return null;
  const marker = `/public/${bucketName}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url
    .substring(index + marker.length)
    .split("?")[0]
    .split("#")[0];
}
