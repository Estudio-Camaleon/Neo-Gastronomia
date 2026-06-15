"use client";

import { AlertCircle } from "lucide-react";
import { useFocusTrap } from "@/core/hooks/useFocusTrap";
import { useScrollLock } from "@/core/hooks/useScrollLock";

interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  negocioNombre?: string;
}

export function LogoutModal({
  onConfirm,
  onCancel,
  negocioNombre,
}: LogoutModalProps) {
  const containerRef = useFocusTrap(true);
  useScrollLock(true);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-[var(--admin-surface)] rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative border border-[var(--admin-border)] animate-in zoom-in-95 duration-150">
        <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-950/20 text-[var(--admin-danger)] flex items-center justify-center mb-5 rounded-full border border-red-200 dark:border-red-900/30">
          <AlertCircle size={24} />
        </div>

        <h3 className="font-bold text-xl text-[var(--admin-text)] text-center tracking-tight mb-2">
          Desconectar{" "}
          <span className="text-[var(--admin-accent)]">Terminal</span>
        </h3>

        <p className="text-sm font-medium text-[var(--admin-text-muted)] text-center leading-relaxed mb-6">
          ¿Confirmás la salida de <br />
          <span className="text-[var(--admin-text)] font-semibold">
            {negocioNombre || "la unidad actual"}
          </span>
          ?
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 bg-[var(--admin-danger)] text-white rounded-xl font-bold tracking-wide transition-colors shadow-sm hover:opacity-90"
          >
            Cerrar Terminal
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3.5 border border-[var(--admin-border)] bg-transparent text-[var(--admin-text)] rounded-xl font-bold text-sm hover:bg-[var(--admin-bg)] transition-colors"
          >
            Cancelar y Volver
          </button>
        </div>
      </div>
    </div>
  );
}
