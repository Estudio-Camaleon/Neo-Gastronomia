import { NeoLogo } from "./loading-screen";

export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <NeoLogo />
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neo-brand)] opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--neo-brand)]" />
          </span>
          <p className="text-sm font-semibold text-[var(--admin-text-muted)]">
            Cargando...
          </p>
        </div>
      </div>
    </div>
  );
}
