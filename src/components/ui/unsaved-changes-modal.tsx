"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useScrollLock } from "@/core/hooks/useScrollLock";

interface UnsavedChangesModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesModal({
  open,
  onConfirm,
  onCancel,
  onDiscard,
}: UnsavedChangesModalProps) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label="Cambios sin guardar"
            className="relative w-full max-w-sm rounded-xl bg-[var(--admin-surface)] p-5 shadow-2xl border border-[var(--admin-border)]"
          >
            <button
              type="button"
              onClick={onCancel}
              className="absolute top-3 right-3 p-1.5 rounded-md text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-colors"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center gap-4 pt-2">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle size={22} className="text-amber-600 dark:text-amber-400" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[var(--admin-text)]">
                  Cambios sin guardar
                </h3>
                <p className="text-sm text-[var(--admin-text-muted)] leading-relaxed max-w-xs">
                  Tenés modificaciones que todavía no se guardaron. Si salís
                  ahora, los cambios se van a perder.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full pt-1">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--admin-border)] text-sm font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-colors"
                >
                  Seguir editando
                </button>
                <button
                  type="button"
                  onClick={onDiscard}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  Descartar cambios
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--admin-accent)] text-sm font-semibold text-white hover:opacity-90 transition-colors shadow-sm"
                >
                  Guardar y salir
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
