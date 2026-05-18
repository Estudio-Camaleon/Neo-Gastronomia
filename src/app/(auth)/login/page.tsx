import { LoginForm } from "@/features/auth-portal/components/LoginForm";
import {
  ChefHat,
  Coffee,
  Handbag,
  ShoppingBasket,
  Library,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f0d] antialiased">
      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
        {/* === SECCIÓN IZQUIERDA: HERO PINTORESCO === */}
        <section className="hidden lg:flex lg:col-span-7 relative p-16 flex-col justify-between items-center overflow-hidden border-r border-[#34d399]/10">
          {/* Fondo Pintoresco Integrado */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/Neo_portada.webp"
              alt="Fondo Neo"
              fill
              className="object-cover opacity-20 brightness-[0.5] saturate-[0.7]"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f0d] via-transparent to-[#0a0f0d]/80" />
          </div>

          <div className="w-full text-left z-10">
            <Link
              href="/"
              className="inline-block transition-transform hover:scale-105"
            >
              <div className="relative h-12 w-32">
                <Image
                  src="/icons/neo_logo_blanco.svg"
                  alt="NEO Logo"
                  fill
                  className="object-contain brightness-110 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                />
              </div>
            </Link>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-xl z-10">
            <div className="space-y-6 text-center">
              <h1 className="text-5xl xl:text-7xl font-bold text-[#e2e8e4] tracking-tighter leading-[1.1]">
                Potenciá tu negocio <br />
                <span className="bg-gradient-to-r from-[#22c55e] to-[#34d399] bg-clip-text text-transparent italic">
                  con NEO
                </span>
              </h1>
              <p className="text-[#8ea195] text-xl leading-relaxed max-w-md mx-auto">
                Ingeniería digital de vanguardia diseñada para la eficiencia
                absoluta de tu flujo gastronómico.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { i: <ChefHat size={18} />, n: "Restaurante" },
                { i: <Coffee size={18} />, n: "Cafetería" },
                { i: <Handbag size={18} />, n: "Tienda" },
                { i: <ShoppingBasket size={18} />, n: "Súper" },
                { i: <Library size={18} />, n: "Librería" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-[#121a16]/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#1a2e23] text-[#e2e8e4]"
                >
                  <span className="text-[#22c55e]">{item.i}</span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                    {item.n}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === SECCIÓN DERECHA: FORMULARIO (Clean Dark) === */}
        <section className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center p-8 md:p-16 relative bg-[#0a0f0d]">
          <div className="w-full max-w-md space-y-12 relative z-10">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-[#e2e8e4] tracking-tight">
                ¡Bienvenido a <span className="text-[#22c55e]">NEO</span>!
              </h2>
              <p className="text-[#8ea195] text-lg">
                Iniciá sesión para administrar tu negocio
              </p>
            </div>

            <div className="glass-card p-1">
              <LoginForm />
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-[#1a2e23]" />
              <span className="text-[#8ea195] text-[10px] font-black uppercase tracking-[0.3em]">
                o continuá con
              </span>
              <div className="h-px flex-1 bg-[#1a2e23]" />
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-4 py-5 px-6 border border-[#1a2e23] rounded-2xl bg-[#121a16] hover:bg-[#1a2e23] hover:border-[#34d399]/30 transition-all text-[#e2e8e4] font-bold text-sm shadow-xl"
            >
              <div className="relative h-6 w-6">
                <Image
                  src="/icons/google.svg"
                  alt="Google"
                  fill
                  className="object-contain"
                />
              </div>
              Continuar con Google
            </button>

            <div className="text-center">
              <p className="text-[#8ea195] text-sm">
                ¿No tenés una cuenta?{" "}
                <Link
                  href="/registro"
                  className="text-[#22c55e] font-bold hover:underline ml-1"
                >
                  Creá una cuenta
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
