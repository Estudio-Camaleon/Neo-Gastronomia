import { LoginForm } from "@/features/auth-portal/components/LoginForm";
import {
  ChefHat,
  Coffee,
  Handbag,
  ShoppingBasket,
  Library,
  UserPlus,
} from "lucide-react";
import { TransitionLink } from "@/components/ui/transition-link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased font-sans">
      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
        {/* === SECCIÓN IZQUIERDA: HERO MINIMALISTA === */}
        <section className="hidden lg:flex lg:col-span-7 relative p-16 flex-col justify-between items-center overflow-hidden bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
          <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.01]">
            <Image
              src="/Neo_portada.webp"
              alt="Fondo Portada"
              fill
              className="object-cover mix-blend-overlay"
              priority
            />
          </div>

          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-zinc-100 dark:bg-zinc-800 rounded-full mix-blend-multiply filter blur-3xl opacity-60 z-0" />

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
                  className="object-contain dark:invert"
                />
              </div>
            </TransitionLink>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-10 max-w-xl z-10">
            <div className="space-y-4 text-center">
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
                Orquestación digital <br />
                <span className="font-light italic text-zinc-400">
                  de tu ecosistema gastronómico
                </span>
              </h1>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto font-medium">
                Arquitectura SaaS multi-tenant diseñada para mitigar tiempos
                muertos y maximizar tickets de facturación.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {[
                { i: <ChefHat size={14} />, n: "Restaurantes" },
                { i: <Coffee size={14} />, n: "Cafeterías" },
                { i: <Handbag size={14} />, n: "Tiendas" },
                { i: <ShoppingBasket size={14} />, n: "Markets" },
                { i: <Library size={14} />, n: "Gourmet" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 px-3.5 py-1.5 rounded-lg text-zinc-800 dark:text-zinc-200 shadow-2xs"
                >
                  <span className="text-zinc-400 dark:text-zinc-500">
                    {item.i}
                  </span>
                  <span className="text-xs font-medium tracking-wide">
                    {item.n}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === SECCIÓN DERECHA: PASARELA LOGIN === */}
        <section className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center p-6 md:p-12 bg-white dark:bg-zinc-950 relative">
          <div className="w-full max-w-md space-y-8 relative z-10">
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Consola Maestro /{" "}
                <span className="font-light text-zinc-400">NEO</span>
              </h2>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs font-medium">
                Introduce tus credenciales de inquilino para inicializar el
                dashboard.
              </p>
            </div>

            <LoginForm />

            <div className="flex items-center gap-4 py-1">
              <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800/80" />
              <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
                O
              </span>
              <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800/80" />
            </div>

            <TransitionLink
              href="/registro"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-all shadow-2xs active:scale-[0.99]"
            >
              <UserPlus size={13} className="text-zinc-400" />
              <span>Crear una Nueva Cuenta Comercial</span>
            </TransitionLink>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-zinc-100 dark:border-zinc-800/40 rounded-lg text-zinc-500 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all"
            >
              <div className="relative h-4 w-4">
                <Image
                  src="/icons/google.svg"
                  alt="Google OAuth"
                  fill
                  className="object-contain opacity-80"
                />
              </div>
              <span>Ingresar con Cuenta Google</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
