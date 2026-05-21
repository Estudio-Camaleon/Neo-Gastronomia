import { Loader2 } from "lucide-react";

type LoadingVariant = "root" | "admin" | "auth" | "public";

type LoadingScreenProps = {
  variant?: LoadingVariant;
};

const variantConfig: Record<
  LoadingVariant,
  { title: string; subtitle: string }
> = {
  root: {
    title: "Preparando NEO",
    subtitle: "Ajustando la interfaz mientras se carga la siguiente vista.",
  },
  admin: {
    title: "Cargando panel de control",
    subtitle: "Sincronizando pedidos, catálogo y configuración del negocio.",
  },
  auth: {
    title: "Validando acceso",
    subtitle: "Comprobando credenciales y recuperando tu sesión.",
  },
  public: {
    title: "Construyendo el menú",
    subtitle: "Leyendo la identidad visual y el contenido disponible.",
  },
};

function SkeletonLine({ className }: { className: string }) {
  return (
    <div
      className={`neo-loading-shimmer bg-[var(--admin-border)] text-[var(--admin-surface-accent)] ${className}`}
    />
  );
}

function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-xs">
      <SkeletonLine className="h-4 w-24 rounded-md" />
      <SkeletonLine
        className={`mt-3 ${compact ? "h-20" : "h-28"} w-full rounded-lg`}
      />
      <div className="mt-3 grid grid-cols-3 gap-3">
        <SkeletonLine className="h-3 rounded-full" />
        <SkeletonLine className="h-3 rounded-full" />
        <SkeletonLine className="h-3 rounded-full" />
      </div>
    </div>
  );
}

export function LoadingScreen({ variant = "root" }: LoadingScreenProps) {
  const config = variantConfig[variant];

  if (variant === "auth") {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-text)] transition-colors duration-200">
        <div className="relative flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-md rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-lg backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--admin-accent)]">
                <Loader2
                  className="h-5 w-5 animate-spin text-white dark:text-zinc-900"
                  strokeWidth={3}
                />
              </div>
              <div className="min-w-0">
                <SkeletonLine className="h-4 w-24 rounded-full" />
                <SkeletonLine className="mt-2 h-8 w-44 max-w-full rounded-full" />
              </div>
            </div>

            <p className="mt-5 max-w-sm text-sm font-medium leading-6 text-[var(--admin-text-muted)]">
              {config.subtitle}
            </p>

            <div className="mt-8 space-y-4">
              <SkeletonLine className="h-3.5 w-24 rounded-md" />
              <SkeletonLine className="h-10 w-full rounded-lg" />
              <SkeletonLine className="h-3.5 w-20 rounded-md" />
              <SkeletonLine className="h-10 w-full rounded-lg" />
              <SkeletonLine className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-text)] transition-colors duration-200">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--admin-border)]">
        <div className="neo-loading-shimmer h-full w-1/3 bg-[var(--admin-accent)] text-[var(--admin-accent)]" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-8 p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-3 text-[var(--admin-text)]">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[var(--admin-text-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--admin-accent)]" />
              {config.title}
            </div>
            <SkeletonLine className="h-8 w-full max-w-lg rounded-lg" />
            <SkeletonLine className="h-4 w-full max-w-xl rounded-md" />
          </div>

          {/* CORREGIDO: Se cambiaron las clases estáticas border-gray-200 y bg-white por los tokens globales */}
          <div className="flex items-center gap-2 self-start rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 shadow-xs">
            <Loader2
              className="h-4 w-4 animate-spin text-[var(--admin-accent)]"
              strokeWidth={2.5}
            />
            <span className="text-sm font-semibold tracking-wide text-[var(--admin-text)]">
              Cargando
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard compact />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-xs">
              <SkeletonLine className="h-4 w-36 rounded-md" />
              <div className="mt-4 grid gap-3">
                <SkeletonLine className="h-10 rounded-lg" />
                <SkeletonLine className="h-10 rounded-lg" />
                <SkeletonLine className="h-10 rounded-lg" />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--admin-accent)] bg-[var(--admin-accent)] p-5 shadow-xs">
              <SkeletonLine className="h-3.5 w-20 rounded-md bg-[var(--admin-surface)]/20" />
              <SkeletonLine className="mt-3 h-7 w-4/5 rounded-md bg-[var(--admin-surface)]/20" />
              <SkeletonLine className="mt-4 h-20 rounded-lg bg-[var(--admin-surface)]/20" />
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .neo-loading-shimmer {
          position: relative;
          overflow: hidden;
        }
        .neo-loading-shimmer::after {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.15) 20%,
            rgba(255, 255, 255, 0.3) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 2s infinite;
          content: '';
        }
        .dark .neo-loading-shimmer::after {
          background-image: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(255, 255, 255, 0.03) 20%,
            rgba(255, 255, 255, 0.08) 60%,
            rgba(0, 0, 0, 0) 100%
          );
        }
      `}</style>
    </div>
  );
}
