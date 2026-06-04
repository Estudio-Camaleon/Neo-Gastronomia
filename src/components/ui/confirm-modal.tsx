"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="bg-[var(--admin-surface)] rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-[var(--admin-border)] animate-in zoom-in-95 duration-150"
      >
        <div
          className={`mx-auto w-12 h-12 flex items-center justify-center mb-5 rounded-full border ${
            variant === "danger"
              ? "bg-red-50 dark:bg-red-950/20 text-[var(--admin-danger)] border-red-200 dark:border-red-900/30"
              : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200 dark:border-amber-900/30"
          }`}
        >
          <AlertCircle size={24} />
        </div>

        <h3
          id="confirm-modal-title"
          className="font-bold text-xl text-[var(--admin-text)] text-center tracking-tight mb-2"
        >
          {title}
        </h3>

        <p className="text-sm font-medium text-[var(--admin-text-muted)] text-center leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className={`w-full py-3.5 text-white rounded-xl font-bold tracking-wide transition-all shadow-sm ${
              variant === "danger"
                ? "bg-[var(--admin-danger)] hover:opacity-90"
                : "bg-amber-600 hover:opacity-90"
            }`}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3.5 border border-[var(--admin-border)] bg-transparent text-[var(--admin-text)] rounded-xl font-bold text-sm hover:bg-[var(--admin-bg)] transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
