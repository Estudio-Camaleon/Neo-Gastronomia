"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";
import { DeleteReasonModal } from "./DeleteReasonModal";

export interface DangerZoneProps {
  initialData: { id: string; nombre: string } | null;
  isDeleting: boolean;
  confirmName: string;
  onConfirmNameChange: (val: string) => void;
  onDelete: (reason: string) => void;
  saveStatus: "idle" | "saving" | "success" | "error";
}

export function DangerZone({
  initialData,
  isDeleting,
  confirmName,
  onConfirmNameChange,
  onDelete,
  saveStatus,
}: DangerZoneProps) {
  const [showReasonModal, setShowReasonModal] = useState(false);

  if (!initialData) return null;

  return (
    <>
      <div className="bg-[var(--admin-surface)] border border-red-500/30 rounded-xl overflow-hidden shadow-sm mt-12 animate-in fade-in duration-300">
        <div className="px-5 py-3.5 border-b border-red-500/20 bg-red-500/5 flex items-center gap-2.5">
          <Trash2 size={16} className="text-red-500" />
          <div>
            <h2 className="font-semibold text-xs text-red-500">
              Zona de Peligro Comercial
            </h2>
            <p className="text-[10px] text-[var(--admin-text-muted)]">
              Acciones irreversibles de desinstalación de infraestructura SaaS.
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-3 text-xs items-start bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertTriangle className="text-red-500 shrink-0 w-4 h-4 mt-0.5" />
            <p className="text-[var(--admin-text)] text-[11px] leading-relaxed">
              Al confirmar la baja, tu catálogo público se cerrará de inmediato.
              Se purgarán de forma definitiva todos tus{" "}
              <strong className="text-red-500">
                productos, menús, categorías, historiales de comandas y accesos de
                administración
              </strong>
              . Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="space-y-2 max-w-md">
            <label className="text-[11px] font-medium text-[var(--admin-text-muted)] block">
              Para confirmar, escribe{" "}
              <span className="font-semibold select-all font-mono text-[var(--admin-text)] bg-[var(--admin-bg)] border border-[var(--admin-border)] px-1 py-0.5 rounded text-xs">
                {initialData.nombre}
              </span>{" "}
              abajo:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={confirmName}
                onChange={(e) => onConfirmNameChange(e.target.value)}
                disabled={saveStatus !== "idle" || isDeleting}
                placeholder="Nombre del negocio exacto"
                className="flex-1 p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all text-xs"
              />
              <button
                type="button"
                onClick={() => setShowReasonModal(true)}
                disabled={
                  confirmName !== initialData.nombre ||
                  saveStatus !== "idle" ||
                  isDeleting
                }
                className="bg-red-500 hover:bg-red-600 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-all disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:hover:bg-red-500 flex items-center justify-center gap-1.5 shrink-0"
              >
                {isDeleting ? <FoodMini size={12} /> : <Trash2 size={13} />}
                <span>Destruir Negocio</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReasonModal && (
        <DeleteReasonModal
          negocioName={initialData.nombre}
          isDeleting={isDeleting}
          onConfirm={(reason) => {
            setShowReasonModal(false);
            onDelete(reason);
          }}
          onCancel={() => setShowReasonModal(false)}
        />
      )}
    </>
  );
}
