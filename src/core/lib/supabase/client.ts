import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/core/types/database.types";
import { env } from "../../config/env";

export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        lock: async (_name, _acquireTimeout, fn) => fn(),
      },
    },
  );
}
