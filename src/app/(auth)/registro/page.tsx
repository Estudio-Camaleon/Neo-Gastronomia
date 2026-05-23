import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { Sparkles, Smartphone, LayoutDashboard } from "lucide-react";
import { TransitionLink } from "@/components/ui/transition-link";
import Image from "next/image";
import "@/features/auth-portal/auth.css";

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

export default function RegisterPage() {
  return (
    <div className="auth-layout-container flex flex-col min-h-screen text-[var(--auth-text)] antialiased font-sans">
      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
        {/* === SECCIÓN IZQUIERDA: HERO DE BENEFICIOS === */}
        <section className="hidden lg:flex lg:col-span-7 bg-[var(--auth-surface-hero)] relative p-16 flex-col justify-between items-center text-center overflow-hidden border-r border-[var(--auth-border)]">
          {/* Elementos Decorativos */}
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-zinc-100/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--auth-border)] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none" />

          {/* Logo Superior */}
          <div className="w-full text-left z-10">
            <TransitionLink
              href="/"
              className="inline-block transition-transform hover:scale-[1.01] active:scale-95"
            >
              <div className="relative h-8 w-24">
                <Image
                  src="/icons/neo_logo_negro.svg"
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
              <h1 className="text-4xl xl:text-5xl font-bold text-[var(--auth-accent)] tracking-tight leading-tight">
                Tu menú digital <br />
                <span className="text-[var(--auth-text-muted)] font-light italic">
                  en 5 minutos
                </span>
              </h1>
              <p className="text-[var(--auth-text-muted)] text-base leading-relaxed max-w-md mx-auto font-medium">
                Únete a los negocios que ya están vendiendo de forma inteligente
                con NEO.
              </p>
            </div>

            {/* Tarjetas de Beneficios */}
            <div className="grid gap-4 w-full">
              {BENEFITS.map((item, i) => (
                <div key={i} className="auth-benefit-card group cursor-default">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#f7f4ec] text-[var(--auth-primary)] transition-colors duration-300">
                    {item.icon}
                  </div>
                  <span className="font-semibold text-[var(--auth-text)] text-sm">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === SECCIÓN DERECHA: FORMULARIO DE REGISTRO === */}
        <section className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center p-6 md:p-12 xl:p-20 relative bg-[var(--auth-surface-form)]">
          <div className="w-full max-w-md space-y-10 z-10">
            {/* Logo Mobile */}
            <div className="flex lg:hidden justify-center mb-4">
              <TransitionLink href="/">
                <div className="relative h-8 w-24">
                  <Image
                    src="/icons/neo_logo_negro.svg"
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
              <h2 className="text-2xl font-bold text-[var(--auth-accent)] tracking-tight">
                Crea tu{" "}
                <span className="font-light text-[var(--auth-text-muted)]">
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
