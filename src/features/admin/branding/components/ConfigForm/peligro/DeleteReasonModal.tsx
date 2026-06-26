"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useFocusTrap } from "@/core/hooks/useFocusTrap";
import { useScrollLock } from "@/core/hooks/useScrollLock";

const REASONS = [
  { value: "caro", label: "Es muy caro" },
  { value: "tiempo", label: "Me falta tiempo para administrarlo" },
  { value: "cerro", label: "Ya no tengo el negocio" },
  { value: "otra_plataforma", label: "Voy a usar otra plataforma" },
  { value: "problemas_tecnicos", label: "Problemas técnicos" },
  { value: "otro", label: "Otro" },
] as const;

interface DeleteReasonModalProps {
  negocioName: string;
  isDeleting: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function DeleteReasonModal({
  negocioName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const containerRef = useFocusTrap(true);
  useScrollLock(true);

  const finalReason = selectedReason === "otro" ? customReason : selectedReason;
  const canSubmit = selectedReason && (selectedReason !== "otro" || customReason.trim().length > 0);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      tabIndex={-1}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-reason-title"
        className="bg-[var(--admin-surface)] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[var(--admin-border)] animate-in zoom-in-95 duration-150"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--admin-bg)] text-[var(--admin-text-muted)] transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="mx-auto w-12 h-12 flex items-center justify-center mb-5 rounded-full border bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200 dark:border-red-900/30">
          <AlertTriangle size={24} />
        </div>

        <h3
          id="delete-reason-title"
          className="font-bold text-[23px] text-[var(--admin-text)] text-center tracking-tight mb-1"
        >
          Destruir {negocioName}
        </h3>
        <p className="text-[17px] font-medium text-[var(--admin-text-muted)] text-center leading-relaxed mb-6">
          Esta acción no se puede deshacer. Decinos por qué te vas para ayudarnos a mejorar:
        </p>

        <div className="space-y-2 mb-6">
          {REASONS.map((reason) => (
            <label
              key={reason.value}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-[17px] ${
                selectedReason === reason.value
                  ? "border-red-500 bg-red-500/10 text-[var(--admin-text)]"
                  : "border-[var(--admin-border)] hover:bg-[var(--admin-bg)] text-[var(--admin-text-muted)]"
              }`}
            >
              <input
                type="radio"
                name="delete-reason"
                value={reason.value}
                checked={selectedReason === reason.value}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="accent-red-500 w-4 h-4"
              />
              {reason.label}
            </label>
          ))}
        </div>

        {selectedReason === "otro" && (
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Contanos brevemente..."
            rows={3}
            className="w-full p-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all text-[17px] resize-none mb-6"
          />
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onConfirm(finalReason)}
            disabled={!canSubmit || isDeleting}
            className="w-full py-3.5 text-white rounded-xl font-bold tracking-wide transition-all shadow-sm bg-red-500 hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none"
          >
            {isDeleting ? "Destruyendo..." : "Sí, destruir negocio"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="w-full py-3.5 border border-[var(--admin-border)] bg-transparent text-[var(--admin-text)] rounded-xl font-bold text-[17px] hover:bg-[var(--admin-bg)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
