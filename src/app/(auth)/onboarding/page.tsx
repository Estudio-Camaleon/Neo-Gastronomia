import { TransitionLink } from "@/components/ui/transition-link";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";

const STEPS = [
  {
    number: 1,
    title: "Completá tu perfil",
    desc: "Agregá el nombre de tu local, logo, horarios y número de WhatsApp.",
  },
  {
    number: 2,
    title: "Cargá tu menú",
    desc: "Añadí categorías, productos, precios y fotos desde el panel.",
  },
  {
    number: 3,
    title: "Compartí tu QR",
    desc: "Descargá el código QR para tus mesas o compartí el enlace en redes.",
  },
];

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[var(--auth-bg,#f7f4ec)] text-[var(--auth-text,#163225)]">
      <div className="max-w-lg w-full space-y-8 sm:space-y-10">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <div className="relative h-8 sm:h-10 w-24 sm:w-28">
              <Image
                src="/icons/neo_logo_negro.webp"
                alt="NEO"
                fill
                sizes="112px"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Bienvenido a{" "}
            <span className="text-[var(--auth-primary,#1f6b3d)]">NEO</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--auth-text-muted,#5d6d64)]">
            En unos pocos pasos tendrás tu menú digital funcionando.
          </p>
        </div>

        <div className="space-y-4">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[var(--auth-border,rgba(28,72,42,0.12))] shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--auth-primary,#1f6b3d)] text-white flex items-center justify-center text-sm font-bold shrink-0">
                {step.number}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">{step.title}</h3>
                <p className="text-xs text-[var(--auth-text-muted,#5d6d64)]">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 p-4 bg-[var(--auth-primary-soft,#d8e8d4)] rounded-xl border border-[var(--auth-border,rgba(28,72,42,0.12))]">
          <Sparkles className="h-5 w-5 text-[var(--auth-primary,#1f6b3d)] shrink-0" />
          <p className="text-xs font-medium text-[var(--auth-text,#163225)]">
            Podés modificar toda esta información después desde el panel de
            configuración.
          </p>
        </div>

        <TransitionLink
          href="/configuracion"
          className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--auth-primary,#1f6b3d)] text-white rounded-xl font-semibold text-sm shadow-md hover:opacity-90 transition-all active:scale-[0.99]"
        >
          Ir a configurar mi local
          <ArrowRight size={16} />
        </TransitionLink>
      </div>
    </div>
  );
}
