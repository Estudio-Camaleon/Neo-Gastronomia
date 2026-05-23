// El compilador de Next.js bloqueará el build instantáneamente si este archivo es tocado por el cliente web
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "../../config/env";

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "🚨 [CRITICAL MAESTRO]: Intento de inicialización del Administrador sin Service Role Token.",
  );
}

export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false, // El cliente administrativo jamás debe persistir sesiones locales
      autoRefreshToken: false,
    },
  },
);
