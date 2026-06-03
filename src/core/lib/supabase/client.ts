// src/core/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/core/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ [NEO CRITICAL]: Variables de entorno de Supabase ausentes.",
  );
}

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
