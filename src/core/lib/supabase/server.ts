// src/core/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/core/types/database.types";

/**
 * Instancia del cliente de Supabase optimizada para Server Components y Actions.
 * Controla la persistencia de cookies forzando políticas de larga duración.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Sanitización e inyección forzada de metadatos de persistencia a Next.js
              cookieStore.set(name, value, {
                ...options,
                maxAge: options.maxAge ?? 60 * 60 * 24 * 365, // Si viene indefinida, forzamos 1 año de vida
                path: options.path ?? "/",
                httpOnly: options.httpOnly ?? true,
                secure: options.secure ?? true,
                sameSite: options.sameSite ?? "lax",
              });
            });
          } catch (e) {
            console.warn(
              `[NEO COOKIE]: No se pudieron persistir cookies en Server Component: ${e instanceof Error ? e.message : "Error desconocido"}`,
            );
          }
        },
      },
    },
  );
}
