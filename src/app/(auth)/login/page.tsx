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

export default async function LoginPage(props: { searchParams?: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;
  const validatedMessage = searchParams?.message === "correo_validado";

  return (
    <div className="auth-layout-container flex flex-col min-h-screen text-[var(--auth-text)] antialiased font-sans">
      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
        {/* === SECCIÓN IZQUIERDA: HERO MINIMALISTA === */}
        <section className="hidden lg:flex lg:col-span-7 relative p-16 flex-col justify-between items-center overflow-hidden bg-[var(--auth-surface-hero)] border-r border-[var(--auth-border)]">
          <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
            <Image
              src="/Neo_portada.webp"
              alt="Fondo Portada"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover mix-blend-overlay"
              priority
            />
          </div>

          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-zinc-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 z-0 pointer-events-none" />

          <div className="w-full text-left z-10">
            <TransitionLink
              href="/"
              className="inline-block transition-transform hover:scale-[1.01] active:scale-95"
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
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-[var(--auth-accent)] leading-tight">
                Bienvenido al futuro <br />
                <span className="font-light italic text-[var(--auth-accent-muted)]">
                  de tu restaurante
                </span>
              </h1>
              <p className="text-[var(--auth-text-muted)] text-sm leading-relaxed max-w-sm mx-auto font-medium">
                Simplificá tu día a día. Gestioná tus pedidos, modernizá tu menú
                y hacé crecer tus ventas sin dolores de cabeza.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {CATEGORIES.map((item, idx) => (
                <div key={idx} className="auth-badge">
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
        <section className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center p-6 md:p-12 bg-[var(--auth-surface-form)] relative">
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
              <h2 className="text-2xl font-bold text-[var(--auth-accent)] tracking-tight">
                Consola Maestro /{" "}
                <span className="font-light text-[var(--auth-accent-muted)]">
                  NEO
                </span>
              </h2>
              <p className="text-[var(--auth-text-muted)] text-xs font-medium">
                Introduce tus credenciales de inquilino para inicializar el
                dashboard.
              </p>
            </div>

            {validatedMessage && (
              <div className="auth-success-box">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Correo electrónico validado correctamente. Ya podés iniciar sesión.</span>
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-[var(--auth-border)] rounded-lg bg-[#f7f4ec] hover:bg-[#eef5e9] text-[var(--auth-text)] text-xs font-medium transition-all shadow-sm active:scale-[0.99]"
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
