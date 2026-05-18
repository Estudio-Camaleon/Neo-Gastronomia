import { Terminal, Layers, Shield, Smartphone, Zap, Bot } from "lucide-react";

export function Features() {
  const featuresList = [
    {
      icon: <Terminal className="h-5 w-5" />,
      title: "Catálogo JSONB Avanzado",
      desc: "Variantes complejas, adiciones por grupo e ingredientes customizables sin causar lag en el render móvil.",
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: "Multi-tenant Nativo",
      desc: "Cada negocio gestiona su menú bajo slugs aislados mediante políticas RLS estrictas en Supabase.",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Seguridad Grado Industrial",
      desc: "Autenticación robusta y aislamiento total de datos de facturación, clientes e historial operativo.",
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "UX/UI Mobile-First",
      desc: "Diseñado quirúrgicamente para emular el rendimiento de una app nativa, acelerando la conversión de compra.",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Sincronización Inmediata",
      desc: "Cambios de stock, precios o disponibilidad impactan en el menú público del cliente en menos de 100ms.",
    },
    {
      icon: <Bot className="h-5 w-5" />,
      title: "Mensajería Estructurada",
      desc: "Motor de formateo automatizado que transforma los carritos en comandos limpios listos para WhatsApp.",
    },
  ];

  return (
    <section id="features" className="py-16 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
            Infraestructura
          </h2>
          <p className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white">
            Diseñado para operaciones de{" "}
            <span className="text-[var(--theme-primary)]">alto volumen</span>
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((feat, idx) => (
            <div
              key={idx}
              className="glass-card p-6 flex flex-col justify-between space-y-4 border border-[var(--theme-border)]"
            >
              <div className="space-y-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-black/50 border border-[var(--theme-border)] text-[var(--theme-primary)] shadow-[0_0_15px_rgba(157,183,28,0.1)]">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">
                  {feat.title}
                </h3>
                <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
