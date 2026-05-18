import { Check, Terminal } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  const featuresSaaS = [
    "Menú digital responsive ilimitado",
    "Gestión de variantes y extras complejos",
    "Pedidos estructurados por WhatsApp",
    "Panel de administración unificado",
    "Métricas básicas de clientes",
    "Soporte prioritario v3.0",
  ];

  return (
    <section id="pricing" className="py-16 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">
            Planes Transparentes
          </h2>
          <p className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white">
            Un único precio.{" "}
            <span className="text-[var(--theme-primary)]">
              Control absoluto.
            </span>
          </p>
        </div>

        {/* Card de Tarifa Única Premium */}
        <div className="max-w-2xl mx-auto glass-card border-2 border-[var(--theme-primary)] bg-[rgba(31,34,18,0.6)] p-8 md:p-12 relative overflow-hidden shadow-[0_0_40px_rgba(157,183,28,0.05)]">
          {/* Badge de destacado */}
          <div className="absolute top-6 right-6 bg-[var(--theme-primary)] text-black font-mono font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded">
            Acceso Completo
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-tighter text-white">
                  $29
                </span>
                <span className="text-sm font-bold text-[var(--theme-text-muted)]">
                  / mes
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-tight text-white">
                  Plan Neo Pro
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                  Ideal para restaurantes y marcas gastronómicas en expansión
                  que exigen velocidad y control de conversión.
                </p>
              </div>
              <Link
                href="/registro"
                className="flex w-full items-center justify-center bg-[var(--theme-primary)] text-black px-6 py-3.5 text-center text-sm font-black uppercase tracking-tight rounded hover:bg-white transition-colors transform active:scale-95"
              >
                Comenzar ahora
              </Link>
            </div>

            {/* Listado de features del plan */}
            <div className="border-t md:border-t-0 md:border-l border-[var(--theme-border)] pt-6 md:pt-0 md:pl-8 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-1.5 mb-4">
                <Terminal className="h-3.5 w-3.5 text-[var(--theme-primary)]" />{" "}
                Incluye:
              </span>
              {featuresSaaS.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-[var(--theme-primary)] mt-0.5 shrink-0" />
                  <span className="text-[var(--theme-text-muted)] hover:text-white transition-colors">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
