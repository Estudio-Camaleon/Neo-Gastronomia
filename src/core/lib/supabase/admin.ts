import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/core/types/database.types";
import { env } from "../../config/env";

export const supabaseAdmin = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false, // El cliente administrativo jamás debe persistir sesiones locales
      autoRefreshToken: false,
    },
  },
);
