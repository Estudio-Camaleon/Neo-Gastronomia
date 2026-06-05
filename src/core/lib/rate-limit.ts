import { createClient } from "@/core/lib/supabase/server";

// In-memory fallback when DB rate_limits table is unavailable
const memoryStore = new Map<string, { count: number; expiresAt: number }>();

export async function checkRateLimit(
  key: string,
  maxAttempts = 10,
  windowMs = 60000,
): Promise<boolean> {
  const now = Date.now();

  // Try DB-backed rate limit first
  try {
    const supabase = await createClient();

    try {
      await (supabase.rpc as unknown as (n: string) => Promise<unknown>)(
        "cleanup_rate_limits",
      );
    } catch {
      // non-critical
    }

    const expiresAt = new Date(now + windowMs).toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from("rate_limits" as never) as any;

    const { data: existing } = await table
      .select("count")
      .eq("key", key)
      .gte("expires_at", new Date(now).toISOString())
      .limit(1)
      .maybeSingle();

    if (!existing) {
      await table.insert({
        key,
        count: 1,
        expires_at: expiresAt,
      });
      return true;
    }

    if (existing.count >= maxAttempts) {
      return false;
    }

    await table.update({ count: existing.count + 1 }).eq("key", key);

    return true;
  } catch (err) {
    console.error(`[RATE LIMIT] DB error, falling back to in-memory:`, err);
  }

  // In-memory fallback
  const entry = memoryStore.get(key);
  if (!entry || entry.expiresAt < now) {
    memoryStore.set(key, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false;
  }

  entry.count++;
  return true;
}
