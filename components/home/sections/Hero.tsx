import Link from "next/link";
import "../style/home.css";

export function Hero() {
  return (
    <section className="neo-home relative pt-36 pb-20 md:pt-56 md:pb-32 px-6 overflow-hidden">
      {/* Luz de fondo */}
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-[var(--theme-primary)] opacity-[0.03] blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center relative z-10">
        {/* Lado Izquierdo */}
        <div className="text-center lg:text-left order-2 lg:order-1">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-8">
            La elegancia de <br />
            <span className="text-[var(--theme-primary)] drop-shadow-[0_0_15px_rgba(157,183,28,0.3)] italic">
              gestionar bien.
            </span>
          </h1>

          <p className="text-[var(--theme-text-muted)] text-base md:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed mb-12 antialiased opacity-90">
            NEO redefine la infraestructura digital gastronómica. Un ecosistema
            diseñado para convertir visitas en clientes leales mediante
            ingeniería de vanguardia.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5">
            <Link
              href="/registro"
              className="btn-elegant px-10 py-5 text-center text-xs uppercase tracking-[0.2em]"
            >
              Comenzar_ahora
            </Link>
            <Link
              href="/demo"
              className="px-10 py-5 rounded-xl border border-[var(--theme-border)] hover:bg-[var(--theme-surface)] transition-all text-center font-bold text-xs uppercase tracking-[0.2em] text-white"
            >
              Ver_demo_en_vivo
            </Link>
          </div>
        </div>

        {/* Lado Derecho: Mockup */}
        <div className="relative order-1 lg:order-2 w-full max-w-[550px] mx-auto lg:max-w-none">
          <div className="glass-card p-3 md:p-4 shadow-2xl relative z-10 overflow-hidden">
            <div className="rounded-xl md:rounded-2xl overflow-hidden bg-[#0a0b06] border border-white/5">
              <div className="h-8 w-full bg-white/5 flex items-center px-4 gap-2 border-b border-white/5">
                <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500/20"></div>
              </div>
              <div className="p-8 md:p-12 space-y-8">
                <div className="h-4 w-1/3 bg-white/10 rounded-full"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 md:h-28 rounded-xl bg-[var(--theme-primary)] opacity-[0.15] border border-[var(--theme-primary)]/20 shadow-[inset_0_0_20px_rgba(157,183,28,0.1)]"></div>
                  <div className="h-20 md:h-28 rounded-xl bg-white/5"></div>
                  <div className="h-20 md:h-28 rounded-xl bg-white/5"></div>
                </div>
                <div className="h-20 w-full bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center">
                  <span className="text-[var(--theme-primary)] text-[10px] md:text-xs tracking-[0.4em] font-mono opacity-60">
                    SYSTEM_READY
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-8 lg:-bottom-6 -left-4 lg:-left-10 glass-card px-6 py-5 border-l-4 border-l-[var(--theme-primary)] shadow-2xl z-20 animate-float">
            <p className="text-sm md:text-lg font-bold">99.9% Uptime</p>
            <p className="text-[10px] text-[var(--theme-text-muted)] uppercase tracking-widest font-mono">
              Sincronización_Total
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
