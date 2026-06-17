// process-env.d.ts
/* eslint-disable no-unused-vars */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Runtime e Infraestructura de Next.js
      NEXT_RUNTIME?: "nodejs" | "edge";
      NODE_ENV: "development" | "production" | "test";

      // Enrutamiento / Dominio Base
      NEXT_PUBLIC_SITE_URL?: string; // <-- APLICADO AQUÍ

      // Conectores Públicos de Supabase
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

      // Llaves de Alta Seguridad del Servidor (Server-Only Actions)
      SUPABASE_SERVICE_ROLE_KEY: string;

      // Integraciones de Mensajería (WhatsApp Engine)
      WHATSAPP_API_URL?: string;
      WHATSAPP_TOKEN?: string;

      // SMTP para correos transaccionales (local Supabase)
      SENDGRID_API_KEY?: string;

      // Resend API key for auth confirmation emails (via Supabase SMTP)
      RESEND_API_KEY?: string;

      // Mercado Pago billing
      MERCADO_PAGO_ACCESS_TOKEN?: string;
      NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY?: string;
    }
  }
}

// Asegura que TypeScript trate al archivo como un módulo global
export {};
