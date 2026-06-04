import { createClient } from "@/core/lib/supabase/server";

export async function checkRateLimit(
  key: string,
  maxAttempts = 10,
  windowMs = 60000,
): Promise<boolean> {
  try {
    const supabase = await createClient();

    try {
      await (supabase.rpc as unknown as (n: string) => Promise<unknown>)(
        "cleanup_rate_limits",
      );
    } catch {
      // non-critical
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + windowMs).toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from("rate_limits" as never) as any;

    const { data: existing } = await table
      .select("count")
      .eq("key", key)
      .gte("expires_at", now.toISOString())
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
  } catch {
    return true;
  }
}
