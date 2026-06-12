"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function LegalModal({
  isOpen,
  onClose,
  title,
  children,
}: LegalModalProps) {
  // Bloquear el scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay oscuro con blur */}
      <div
        className="absolute inset-0 bg-[#0a1811]/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-white border border-[var(--theme-border)] shadow-[0_20px_60px_rgba(31,107,61,0.2)] rounded-[28px] animate-fade-in-up overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-[var(--theme-border)] bg-[var(--theme-surface-soft)] px-6 py-5 sm:px-8">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--theme-text)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--theme-text-muted)] hover:bg-white hover:text-[var(--theme-primary)] hover:shadow-sm transition-all"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 custom-scrollbar">
          <div className="space-y-6 text-sm sm:text-base font-medium text-[var(--theme-text-muted)] leading-relaxed">
            {children}
          </div>
        </div>

        {/* Pie del modal */}
        <div className="border-t border-[var(--theme-border)] bg-gray-50 px-6 py-4 sm:px-8 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-[var(--theme-primary)] px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
