import { LoginForm } from "@/features/auth/components/LoginForm";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import {
  ChefHat,
  Coffee,
  Handbag,
  ShoppingBasket,
  Library,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { TransitionLink } from "@/components/ui/transition-link";
import Image from "next/image";
import "@/features/auth/auth.css";

const CATEGORIES = [
  { icon: <ChefHat size={14} />, label: "Restaurantes" },
  { icon: <Coffee size={14} />, label: "Cafeterías" },
  { icon: <Handbag size={14} />, label: "Tiendas" },
  { icon: <ShoppingBasket size={14} />, label: "Markets" },
  { icon: <Library size={14} />, label: "Gourmet" },
];

export default async function LoginPage(props: {
  searchParams?: Promise<{ message?: string }>;
}) {
  const searchParams = await props.searchParams;
  const validatedMessage = searchParams?.message === "correo_validado";

  return (
    <div className="auth-layout-container flex flex-col min-h-screen text-[var(--auth-text)] antialiased font-sans relative overflow-hidden">
      {/* Blobs orgánicos animados de fondo (global) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-8%] left-[-5%] w-[500px] h-[500px] bg-[var(--auth-primary)]/8 rounded-full auth-blob auth-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-[var(--auth-accent-secondary)]/10 rounded-full auth-blob-reverse auth-pulse-glow" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-[var(--auth-primary-soft)]/20 rounded-full auth-blob-secondary" />
      </div>

      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden relative z-10">
        {/* === SECCIÓN IZQUIERDA: HERO VIVO === */}
        <section className="hidden lg:flex lg:col-span-7 relative p-12 xl:p-16 flex-col justify-between items-center overflow-hidden bg-gradient-to-br from-[var(--auth-bg)] via-transparent to-[var(--auth-primary-soft)]/10 border-r border-[var(--auth-border)]">
          {/* Dot grid pattern */}
          <div className="absolute inset-0 auth-dot-grid opacity-30 pointer-events-none" />

          {/* Blobs locales del lado izquierdo */}
          <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[var(--auth-primary)]/5 rounded-full auth-blob pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-15%] w-[500px] h-[500px] bg-[var(--auth-accent-secondary)]/8 rounded-full auth-blob-reverse pointer-events-none" />

          {/* Líneas arquitectónicas sutiles */}
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-gradient-to-b from-transparent via-[var(--auth-border)] to-transparent opacity-30" />
          <div className="absolute top-0 bottom-0 right-1/3 w-px bg-gradient-to-b from-transparent via-[var(--auth-border)] to-transparent opacity-20" />

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

          <div className="flex-1 flex flex-col items-center justify-center space-y-10 max-w-xl z-10">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl xl:text-5xl font-black tracking-tight text-[var(--auth-accent)] leading-[0.95] uppercase">
                Bienvenido al <br />
                <span className="text-[var(--auth-accent-muted)] font-light italic normal-case">
                  futuro de tu restaurante
                </span>
              </h2>
              <p className="text-[var(--auth-text-muted)] text-sm leading-relaxed max-w-sm mx-auto font-medium">
                Simplificá tu día a día. Gestioná tus pedidos, modernizá tu menú
                y hacé crecer tus ventas sin dolores de cabeza.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {CATEGORIES.map((item, idx) => (
                <div
                  key={idx}
                  className="auth-badge animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <span className="text-[var(--auth-primary)]">
                    {item.icon}
                  </span>
                  <span className="text-xs font-medium tracking-wide">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === SECCIÓN DERECHA: PASARELA LOGIN === */}
        <section className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center p-4 sm:p-6 md:p-12 relative bg-[var(--auth-surface-form)] backdrop-blur-xl">
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

            <div className="text-center lg:text-left space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-[var(--auth-accent)] uppercase">
                Consola Maestro{" "}
                <span className="font-light normal-case text-[var(--auth-accent-muted)]">
                  / NEO
                </span>
              </h1>
              <p className="text-[var(--auth-text-muted)] text-xs font-medium">
                Introduce tus credenciales de inquilino para inicializar el
                dashboard.
              </p>
            </div>

            {validatedMessage && (
              <div className="auth-success-box">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Correo electrónico validado correctamente. Ya podés iniciar
                  sesión.
                </span>
              </div>
            )}

            <LoginForm />

            <div className="flex items-center gap-4 py-1">
              <div className="h-px flex-1 bg-[var(--auth-border)]" />
              <span className="text-[var(--auth-text-muted)] text-[10px] font-semibold uppercase tracking-wider">
                O
              </span>
              <div className="h-px flex-1 bg-[var(--auth-border)]" />
            </div>

            <TransitionLink
              href="/registro"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-[var(--auth-border)] rounded-xl bg-[var(--auth-bg)] hover:bg-[var(--auth-primary-soft)] text-[var(--auth-text)] text-xs font-medium transition-all duration-200 active:scale-[0.97]"
            >
              <UserPlus size={14} className="text-[var(--auth-primary)]" />
              <span>Crear una Nueva Cuenta Comercial</span>
            </TransitionLink>

            <GoogleSignInButton />
          </div>
        </section>
      </div>
    </div>
  );
}
