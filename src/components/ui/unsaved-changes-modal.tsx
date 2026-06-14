"use client";

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
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            role="dialog"
            aria-modal="true"
            className="relative max-w-md w-full rounded-2xl bg-white p-6 text-left shadow-2xl ring-1 ring-black/8"
          >
            <button
              type="button"
              onClick={onCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle size={22} className="text-amber-600" />
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">
                  Cambios sin guardar
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Tenés modificaciones que todavía no se guardaron. Si salís
                  ahora, los cambios se van a perder.
                </p>

                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Seguir editando
                  </button>
                  <button
                    type="button"
                    onClick={onDiscard}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
