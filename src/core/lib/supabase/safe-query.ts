import { PostgrestSingleResponse } from "@supabase/supabase-js";

// Orquestador seguro de peticiones de grado industrial
export async function safeDbCall<T>(
  queryPromise: Promise<PostgrestSingleResponse<T>>,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await queryPromise;

    if (error) {
      // Reemplaza el instrumentation.ts de forma local y controlada con contexto real
      console.error(
        `[⚠️ SUPABASE ERROR]: ${error.message} (Código: ${error.code})`,
      );
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (fatalError) {
    // Captura caídas críticas de red o deserialización de datos JSONB
    const msg =
      fatalError instanceof Error ? fatalError.message : "Error desconocido";
    console.error(`[🚨 NEO DATABASE FATAL CRASH]:`, fatalError);
    return { data: null, error: msg };
  }
}
