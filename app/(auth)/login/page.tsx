import { LoginForm } from "@/components/auth/LoginForm";
import { Footer } from "@/components/shared/Footer";
import {
  ShoppingBasket,
  ChefHat,
  Coffee,
  Library,
  Handbag,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Importación del optimizador nativo de Next.js

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-main transition-colors duration-300 antialiased font-montserrat">
      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
        {/* === SECCIÓN IZQUIERDA: HERO DE MARCA === */}
        <section className="hidden lg:flex lg:col-span-7 bg-bg-alt relative p-16 flex-col justify-between items-center text-center overflow-hidden">
          {/* Logo Superior */}
          <div className="w-full text-left z-10">
            <Link
              href="/"
              className="inline-block transition-transform hover:scale-105 active:scale-95"
            >
              {/* Envoltura relativa con dimensiones controladas para el logo nativo */}
              <div className="relative h-10 w-32">
                <Image
                  src="/icons/neo_logo_negro.svg"
                  alt="NEO Logo"
                  fill
                  priority // Evita penalizaciones de LCP dándole prioridad en la carga inicial
                  sizes="128px"
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Contenido Central */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-xl z-10">
            <div className="space-y-6">
              <h1 className="text-5xl xl:text-6xl font-black text-text-primary tracking-tighter leading-[1.1]">
                Potenciá tu negocio <br />
                <span className="text-primary">con NEO</span>
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed max-w-md mx-auto font-medium">
                Un sistema completo, simple y moderno para gestionar tu negocio
                de forma eficiente, sin importar el rubro.
              </p>
            </div>

            {/* Rubros Adaptados con Lucide */}
            <div className="space-y-6 w-full">
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { i: <ChefHat size={20} />, n: "Restaurante" },
                  { i: <Coffee size={20} />, n: "Cafetería" },
                  { i: <Handbag size={20} />, n: "Tienda" },
                  { i: <ShoppingBasket size={20} />, n: "Súper" },
                  { i: <Library size={20} />, n: "Librería" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-surface px-5 py-2.5 rounded-2xl shadow-sm border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 group cursor-default"
                  >
                    <span className="text-primary group-hover:scale-110 transition-transform duration-300">
                      {item.i}
                    </span>
                    <span className="text-xs font-black text-text-secondary tracking-tight">
                      {item.n}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decoración extra para resaltar la curva */}
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
        </section>

        {/* === SECCIÓN DERECHA: FORMULARIO === */}
        <section className="col-span-12 lg:col-span-5 flex flex-col shadow-[inset_20px_0_20px_-20px_rgba(0,0,0,0.9)] justify-center items-center p-6 md:p-12 xl:p-20 relative bg-surface dark:bg-bg-dark transition-colors duration-300">
          <div className="w-full max-w-md space-y-10">
            {/* Header del Formulario */}
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black text-text-primary dark:text-text-inverse tracking-tight">
                ¡Bienvenido a <span className="text-primary">NEO</span>!
              </h2>
              <p className="text-text-secondary dark:text-text-muted text-base font-medium">
                Iniciá sesión para administrar tu negocio
              </p>
            </div>

            {/* Form Container */}
            <div className="bg-bg-main/50 dark:bg-bg-darker/30 p-1 rounded-[2rem]">
              <LoginForm />
            </div>

            {/* Separador */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-border dark:bg-border-dark" />
              <span className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                o continuá con
              </span>
              <div className="h-px flex-1 bg-border dark:bg-border-dark" />
            </div>

            {/* Botón Social */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-4 px-6 border border-border dark:border-border-dark rounded-2xl bg-surface dark:bg-surface-dark hover:bg-bg-main dark:hover:bg-bg-darker transition-all text-text-primary dark:text-text-inverse font-bold text-sm shadow-sm active:scale-95 group"
            >
              <div className="relative h-5 w-5 group-hover:rotate-12 transition-transform duration-300">
                <Image
                  src="/icons/google.svg" // <-- Ruta estática local libre de bloqueos
                  alt="Google"
                  fill
                  sizes="20px"
                  className="object-contain"
                />
              </div>
              Continuar con Google
            </button>

            {/* Footer de Registro */}
            <div className="text-center pt-4">
              <p className="text-text-muted text-sm font-medium">
                ¿No tenés una cuenta?{" "}
                <Link
                  href="/registro"
                  className="text-primary font-black hover:text-primary-hover transition-colors ml-1 inline-block hover:-translate-y-0.5 transform"
                >
                  Creá una cuenta
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Global */}
      <Footer />
    </div>
  );
}
