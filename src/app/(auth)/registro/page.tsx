import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { Sparkles, Smartphone, LayoutDashboard, CheckCircle2 } from "lucide-react";
import { TransitionLink } from "@/components/ui/transition-link";
import Image from "next/image";
import "@/features/auth/auth.css";

const BENEFITS = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    text: "Sin comisiones por pedido",
  },
  {
    icon: <Smartphone className="w-5 h-5" />,
    text: "Optimizado para móviles",
  },
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    text: "Panel de gestión intuitivo",
  },
];

const FEATURES_CHECK = [
  "Menú QR en minutos",
  "Soporte 24/7",
  "Marca blanca",
];

export default function RegisterPage() {
  return (
    <div className="auth-layout-container flex flex-col min-h-screen text-[var(--auth-text)] antialiased font-sans relative overflow-hidden">
      {/* Blobs orgánicos animados de fondo (global) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-8%] right-[-5%] w-[500px] h-[500px] bg-[var(--auth-accent-secondary)]/8 rounded-full auth-blob auth-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-[var(--auth-primary)]/10 rounded-full auth-blob-reverse auth-pulse-glow" />
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-[var(--auth-primary-soft)]/25 rounded-full auth-blob-secondary" />
      </div>

      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden relative z-10">
        {/* === SECCIÓN IZQUIERDA: HERO DE BENEFICIOS VIVO === */}
        <section className="hidden lg:flex lg:col-span-7 relative p-16 flex-col justify-between items-center text-center overflow-hidden bg-gradient-to-br from-[var(--auth-bg)] via-transparent to-[var(--auth-primary-soft)]/10 border-r border-[var(--auth-border)]">
          {/* Dot grid pattern */}
          <div className="absolute inset-0 auth-dot-grid opacity-30 pointer-events-none" />

          {/* Blobs locales */}
          <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-[var(--auth-primary)]/5 rounded-full auth-blob pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-15%] w-[500px] h-[500px] bg-[var(--auth-accent-secondary)]/8 rounded-full auth-blob-reverse pointer-events-none" />

          {/* Líneas arquitectónicas */}
          <div className="absolute top-0 bottom-0 left-1/3 w-px bg-gradient-to-b from-transparent via-[var(--auth-border)] to-transparent opacity-30" />
          <div className="absolute top-0 bottom-0 right-1/4 w-px bg-gradient-to-b from-transparent via-[var(--auth-border)] to-transparent opacity-20" />

          {/* Logo Superior */}
          <div className="w-full text-left z-10">
            <TransitionLink
              href="/"
              className="inline-block transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <div className="relative h-8 w-24">
                <Image
                  src="/icons/neo_logo_negro.webp"
                  alt="NEO Logo"
                  fill
                  sizes="96px"
                  className="object-contain"
                  priority
                />
              </div>
            </TransitionLink>
          </div>

          {/* Contenido Central */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-xl z-10">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-[var(--auth-accent)] leading-[0.95] uppercase">
                Tu menú digital <br />
                <span className="text-[var(--auth-accent-muted)] font-light italic normal-case">
                  en 5 minutos
                </span>
              </h1>
              <p className="text-[var(--auth-text-muted)] text-base leading-relaxed max-w-md mx-auto font-medium">
                Únete a los negocios que ya están vendiendo de forma inteligente
                con NEO.
              </p>
            </div>

            {/* Tarjetas de Beneficios */}
            <div className="grid gap-3 w-full max-w-sm">
              {BENEFITS.map((item, i) => (
                <div key={i} className="auth-benefit-card group cursor-default animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--auth-bg)] text-[var(--auth-primary)] border border-[var(--auth-border)] transition-all duration-300 group-hover:border-[var(--auth-primary)]/30 group-hover:shadow-sm">
                    {item.icon}
                  </div>
                  <span className="font-semibold text-[var(--auth-text)] text-sm">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Chips de features */}
            <div className="flex flex-wrap justify-center gap-2">
              {FEATURES_CHECK.map((feat, idx) => (
                <div key={idx} className="auth-badge animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${300 + idx * 100}ms` }}>
                  <CheckCircle2 size={12} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === SECCIÓN DERECHA: FORMULARIO DE REGISTRO === */}
        <section className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center p-6 md:p-12 xl:p-20 relative bg-[var(--auth-surface-form)] backdrop-blur-xl">
          {/* Blobs sutiles del lado del form */}
          <div className="absolute top-[-5%] right-[-10%] w-[300px] h-[300px] bg-[var(--auth-primary)]/5 rounded-full auth-blob pointer-events-none" />
          <div className="absolute bottom-[-5%] left-[-10%] w-[250px] h-[250px] bg-[var(--auth-accent-secondary)]/6 rounded-full auth-blob-reverse pointer-events-none" />

          <div className="w-full max-w-md space-y-8 relative z-10">
            {/* Logo Mobile */}
            <div className="flex lg:hidden justify-center mb-4">
              <TransitionLink href="/">
                <div className="relative h-8 w-24">
                  <Image
                    src="/icons/neo_logo_negro.webp"
                    alt="NEO Logo"
                    fill
                    sizes="96px"
                    className="object-contain"
                    priority
                  />
                </div>
              </TransitionLink>
            </div>

            {/* Header del Formulario */}
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-[var(--auth-accent)] uppercase">
                Crea tu{" "}
                <span className="font-light normal-case text-[var(--auth-accent-muted)]">
                  cuenta
                </span>
              </h2>
              <p className="text-[var(--auth-text-muted)] text-xs font-medium">
                Completa los datos para empezar tu transformación digital.
              </p>
            </div>

            <div className="w-full">
              <RegisterForm />
            </div>

            <div className="text-center lg:text-left pt-2">
              <p className="text-[var(--auth-text-muted)] text-sm font-medium">
                ¿Ya tienes una cuenta?{" "}
                <TransitionLink
                  href="/login"
                  className="text-[var(--auth-primary)] font-semibold hover:underline transition-colors ml-1 inline-block"
                >
                  Inicia sesión
                </TransitionLink>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
