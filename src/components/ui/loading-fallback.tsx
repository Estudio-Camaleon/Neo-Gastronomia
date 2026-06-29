export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--admin-accent)] animate-pulse" />
          <p className="text-sm font-medium text-[var(--admin-text-muted)]">
            Cargando...
          </p>
        </div>
      </div>
    </div>
  );
}
