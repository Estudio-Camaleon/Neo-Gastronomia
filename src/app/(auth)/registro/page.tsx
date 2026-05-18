import { RegisterForm } from "@/features/auth-portal/components/RegisterForm";
import { Sparkles, Smartphone, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-main transition-colors duration-300 antialiased font-montserrat">
      {/* Contenedor Principal en Grid */}
      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
        {/* === SECCIÓN IZQUIERDA: HERO DE BENEFICIOS === */}
        <section className="hidden lg:flex lg:col-span-7 bg-bg-alt relative p-16 flex-col justify-between items-center text-center overflow-hidden border-r border-border/50 shadow-[inset_-20px_0_20px_-20px_rgba(0,0,0,0.5)]">
          {/* Logo Superior */}
          <div className="w-full text-left z-10">
            <Link
              href="/"
              className="inline-block transition-transform hover:scale-105 active:scale-95"
            >
              {/* Envoltura relativa con dimensiones controladas para asegurar el LCP */}
              <div className="relative h-10 w-32">
                <Image
                  src="/icons/neo_logo_negro.svg"
                  alt="NEO Logo"
                  fill
                  priority // Carga inmediata prioritaria para el rastreador de Next.js
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
                Tu menú digital <br />
                <span className="text-primary">en 5 minutos</span>
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed max-w-md mx-auto font-medium">
                Unite a negocios que ya están vendiendo de forma inteligente con
                NEO.
              </p>
            </div>

            {/* Tarjeta de Beneficios Rápidos */}
            <div className="grid gap-4 w-full">
              {[
                {
                  icon: <Sparkles className="w-6 h-6" />,
                  text: "Sin comisiones por pedido",
                },
                {
                  icon: <Smartphone className="w-6 h-6" />,
                  text: "Optimizado para móviles",
                },
                {
                  icon: <LayoutDashboard className="w-6 h-6" />,
                  text: "Panel de gestión intuitivo",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-5 bg-surface border border-border-strong rounded-[1.5rem] shadow-sm hover:border-primary/30 transition-all duration-300 group hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                  <span className="font-bold text-text-primary text-sm tracking-tight">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === SECCIÓN DERECHA: FORMULARIO DE REGISTRO === */}
        <section className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center p-6 md:p-12 xl:p-20 relative bg-surface">
          <div className="w-full max-w-md space-y-10">
            {/* Header del Formulario */}
            <div className="text-center lg:text-left space-y-3">
              <h2 className="text-4xl font-black text-text-primary tracking-tight">
                Crea tu <span className="text-primary">cuenta</span>
              </h2>
              <p className="text-text-secondary text-base font-medium">
                Completa los datos para empezar tu transformación digital.
              </p>
            </div>

            {/* El componente de Registro */}
            <div className="bg-bg-main/50 p-1 rounded-[2rem]">
              <RegisterForm />
            </div>

            {/* Footer de Volver al Login */}
            <div className="text-center lg:text-left pt-2">
              <p className="text-text-muted text-sm font-medium">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/login"
                  className="text-primary font-black hover:text-primary-hover transition-colors ml-1 inline-block hover:-translate-y-0.5 transform"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
