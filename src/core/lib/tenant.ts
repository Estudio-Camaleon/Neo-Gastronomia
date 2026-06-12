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

export function parseStorageUrl(
  url: string | null | undefined,
): { bucket: string; path: string } | null {
  if (!url || url.trim() === "") return null;
  const marker = "/storage/v1/object/public/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const afterMarker = url.substring(index + marker.length);
  const slashIdx = afterMarker.indexOf("/");
  if (slashIdx === -1) return null;
  const bucket = afterMarker.substring(0, slashIdx);
  const path = afterMarker
    .substring(slashIdx + 1)
    .split("?")[0]
    .split("#")[0];
  return { bucket, path };
}

export function extractStoragePath(
  url: string | null | undefined,
  bucketName: string,
): string | null {
  const parsed = parseStorageUrl(url);
  if (!parsed || parsed.bucket !== bucketName) return null;
  return parsed.path;
}
