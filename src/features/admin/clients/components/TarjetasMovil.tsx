"use client";

import { User, Trophy, MessageCircle, StickyNote, Calendar } from "lucide-react";
import type { ClienteResumen } from "@/core/types/domain";
import { formatPesos, esClienteVirtual } from "@/features/admin/clients/client-utils";
import { toast } from "sonner";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function daysSince(iso: string | null): string | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return null;
}

interface TarjetasMovilProps {
  clientes: ClienteResumen[];
  onEditNotes: (cliente: ClienteResumen) => void;
}

export function TarjetasMovil({ clientes, onEditNotes }: TarjetasMovilProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden p-4">
      {clientes.map((cliente, index) => {
        const esTop1 = index === 0;
        const rel = cliente.ultimoPedido ? daysSince(cliente.ultimoPedido) : null;
        return (
          <div
            key={cliente.id}
            className="admin-card p-4 rounded-xl flex flex-col space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    esTop1
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] border border-[var(--admin-border)]"
                  }`}
                >
                  {esTop1 ? <Trophy size={18} /> : <User size={18} />}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-accent)] block mb-0.5">
                    Rango #{index + 1}
                  </span>
                  <h4 className="font-bold text-[var(--admin-text)] leading-tight">
                    {cliente.nombre}
                  </h4>
                </div>
              </div>
              <span className="font-bold text-lg text-[var(--admin-text)] tracking-tight font-mono tabular-nums">
                {formatPesos(cliente.totalGasto)}
              </span>
            </div>

            <div className="bg-[var(--admin-bg)] p-3 rounded-lg border border-[var(--admin-border)] flex justify-between items-center text-sm">
              <span className="font-semibold text-[var(--admin-text-muted)] text-xs uppercase tracking-wide">
                Frecuencia de compra
              </span>
              <span className="font-bold text-[var(--admin-text)] bg-[var(--admin-surface)] px-2.5 py-1 rounded border border-[var(--admin-border)] shadow-sm text-xs">
                {cliente.pedidos} pedidos
              </span>
            </div>

            {/* Último pedido */}
            <div className="bg-[var(--admin-bg)] p-3 rounded-lg border border-[var(--admin-border)] flex justify-between items-center text-sm">
              <span className="font-semibold text-[var(--admin-text-muted)] text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Calendar size={12} />
                Último Pedido
              </span>
              {cliente.ultimoPedido ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[var(--admin-text)]">
                    {formatDate(cliente.ultimoPedido)}
                  </span>
                  {rel && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-[1px] rounded-full ${
                        rel === "Hoy" || rel === "Ayer"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-[var(--admin-surface)] text-[var(--admin-text-muted)]"
                      }`}
                    >
                      {rel}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-[var(--admin-text-muted)] italic">
                  Sin pedidos
                </span>
              )}
            </div>

            {cliente.notas && (
              <p className="text-xs text-amber-600 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 leading-relaxed font-medium">
                {cliente.notas}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1 shrink-0">
              <button
                onClick={() => {
                  if (esClienteVirtual(cliente.id)) {
                    toast.info("Registra al cliente desde un pedido para gestionar sus notas.");
                    return;
                  }
                  onEditNotes(cliente);
                }}
                className="btn-secondary flex-1 text-[11px]"
                aria-label={`Editar notas de ${cliente.nombre}`}
              >
                <StickyNote size={14} /> Anotaciones
              </button>
              {cliente.telefono ? (
                <a
                  href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366] hover:opacity-90 text-white rounded-xl text-[11px] font-bold transition-all active:scale-95 shadow-sm"
                  aria-label={`Enviar WhatsApp a ${cliente.nombre}`}
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              ) : (
                <button
                  disabled
                  className="flex-1 py-2.5 px-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)] rounded-xl text-xs font-bold cursor-not-allowed flex justify-center items-center"
                >
                  Sin Teléfono
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
