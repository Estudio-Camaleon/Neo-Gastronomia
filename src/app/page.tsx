import { HomePage } from "@/features/marketing/components/HomePage";

export const metadata = {
  title: "NEO | Plataforma Gastronómica Multi-tenant",
  description:
    "Crea tu menú digital neo-brutalista de alto impacto y gestiona pedidos en tiempo real.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NEO",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Sistema de menú digital y gestión de pedidos para gastronómicos. Creá tu menú online, recibí pedidos por WhatsApp y gestioná tu negocio sin comisiones.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://neo.app",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "ARS",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage />
    </>
  );
}
