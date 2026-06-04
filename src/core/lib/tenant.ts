import { createClient } from "@/core/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAuthenticatedTenant(supabase?: SupabaseClient) {
  const client = supabase ?? (await createClient());

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();
  if (authError || !user) throw new Error("Acceso denegado. No autenticado.");

  // Check if user is owner
  const { data: negocios } = await client
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (negocios?.[0]) return negocios[0].id;

  // Check if user is team member
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: memberships } = await (client.from("team_members" as any) as any)
    .select("negocio_id")
    .eq("user_id", user.id)
    .limit(1);

  if (memberships?.[0]?.negocio_id) return memberships[0].negocio_id;

  throw new Error("Inconsistencia Multi-tenant: Local no asignado.");
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

  // Check if user is owner
  const { data: negocios } = await client
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (negocios?.[0]) return { userId: user.id, negocioId: negocios[0].id };

  // Check if user is team member
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: memberships } = await (client.from("team_members" as any) as any)
    .select("negocio_id, role")
    .eq("user_id", user.id)
    .limit(1);

  if (memberships?.[0]?.negocio_id) {
    return { userId: user.id, negocioId: memberships[0].negocio_id };
  }

  throw new Error("Inconsistencia Multi-tenant: Local no asignado.");
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
