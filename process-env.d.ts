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

      // Stripe billing
      STRIPE_SECRET_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;
      STRIPE_PRO_PRICE_ID?: string;
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    }
  }
}

// Asegura que TypeScript trate al archivo como un módulo global
export {};
