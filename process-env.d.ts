declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Forzamos el tipado explícito de la variable interna de Next.js
      NEXT_RUNTIME?: "nodejs" | "edge";

      // Aprovechamos para tipar variables críticas del SaaS
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
    }
  }
}

// Asegura que TypeScript trate al archivo como un módulo global
export {};
