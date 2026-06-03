type LoadingVariant = "root" | "admin" | "auth" | "public";

type LoadingScreenProps = {
  variant?: LoadingVariant;
};

const variantConfig: Record<
  LoadingVariant,
  { title: string; subtitle: string }
> = {
  root: {
    title: "Inicializando NEO",
    subtitle: "Preparando la plataforma para ofrecerte la mejor experiencia.",
  },
  admin: {
    title: "Cargando dashboard",
    subtitle: "Sincronizando pedidos, catálogo y configuración del negocio.",
  },
  auth: {
    title: "Validando acceso",
    subtitle: "Verificando credenciales y restaurando tu sesión.",
  },
  public: {
    title: "Armando el menú",
    subtitle: "Cargando la identidad visual y los productos disponibles.",
  },
};

function SkeletonLine({ className }: { className: string }) {
  return <div className={`neo-shimmer rounded-md ${className}`} />;
}

function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="neo-skeleton-card">
      <SkeletonLine className="h-4 w-24" />
      <SkeletonLine className={`mt-3 ${compact ? "h-20" : "h-28"} w-full`} />
      <div className="mt-3 grid grid-cols-3 gap-3">
        <SkeletonLine className="h-3" />
        <SkeletonLine className="h-3" />
        <SkeletonLine className="h-3" />
      </div>
    </div>
  );
}

function NeoLogo() {
  return (
    <div className="relative flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--neo-brand)] shadow-lg shadow-[var(--neo-brand)]/30">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <div className="absolute inset-0 animate-pulse rounded-xl bg-white/20" />
      </div>
      <div>
        <p className="text-xs font-black tracking-[0.2em] text-[var(--neo-brand)] uppercase">
          NEO
        </p>
        <p className="text-[11px] font-medium text-[var(--neo-muted)] tracking-wide">
          Sistema de Pedidos
        </p>
      </div>
    </div>
  );
}

function NeoSpinner() {
  return (
    <div className="relative flex items-center gap-2.5">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neo-brand)] opacity-40" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--neo-brand)]" />
      </span>
      <span className="text-sm font-semibold tracking-wide text-[var(--neo-muted)]">
        Cargando
      </span>
    </div>
  );
}

export function LoadingScreen({ variant = "root" }: LoadingScreenProps) {
  const config = variantConfig[variant];

  if (variant === "auth") {
    return (
      <div className="neo-screen">
        <div className="neo-screen-center">
          <div className="neo-card max-w-md">
            <NeoLogo />
            <p className="mt-5 max-w-sm text-sm font-medium leading-6 text-[var(--neo-muted)]">
              {config.subtitle}
            </p>
            <div className="mt-8 space-y-4">
              <SkeletonLine className="h-3.5 w-24" />
              <SkeletonLine className="h-10 w-full" />
              <SkeletonLine className="h-3.5 w-20" />
              <SkeletonLine className="h-10 w-full" />
              <SkeletonLine className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "public") {
    return (
      <div className="neo-screen">
        <main className="neo-main">
          <div className="flex items-center gap-6">
            <NeoLogo />
            <div className="h-8 w-px bg-[var(--neo-border)]" />
            <div className="space-y-1">
              <p className="text-sm font-bold tracking-wide text-[var(--neo-text)]">
                {config.title}
              </p>
              <p className="text-sm text-[var(--neo-muted)]">
                {config.subtitle}
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard compact />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="neo-skeleton-card">
                <SkeletonLine className="h-4 w-36" />
                <div className="mt-4 grid gap-3">
                  <SkeletonLine className="h-10" />
                  <SkeletonLine className="h-10" />
                  <SkeletonLine className="h-10" />
                </div>
              </div>
              <div className="neo-skeleton-card-solid">
                <SkeletonLine className="h-3.5 w-20" />
                <SkeletonLine className="mt-3 h-7 w-4/5" />
                <SkeletonLine className="mt-4 h-20" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="neo-screen">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--admin-border)]">
        <div className="neo-shimmer h-full w-1/3 bg-[var(--admin-accent)]" />
      </div>
      <main className="neo-main">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[var(--admin-text-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--admin-accent)] animate-pulse" />
              {config.title}
            </div>
            <SkeletonLine className="h-8 w-full max-w-lg" />
            <SkeletonLine className="h-4 w-full max-w-xl" />
          </div>
          <NeoSpinner />
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard compact />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="neo-skeleton-card">
              <SkeletonLine className="h-4 w-36" />
              <div className="mt-4 grid gap-3">
                <SkeletonLine className="h-10" />
                <SkeletonLine className="h-10" />
                <SkeletonLine className="h-10" />
              </div>
            </div>
            <div className="neo-skeleton-card-solid">
              <SkeletonLine className="h-3.5 w-20" />
              <SkeletonLine className="mt-3 h-7 w-4/5" />
              <SkeletonLine className="mt-4 h-20" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

