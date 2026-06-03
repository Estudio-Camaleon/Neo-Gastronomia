"use client";

import {
  Smartphone,
  Truck,
  MessageCircle,
  XCircle,
  Check,
  CheckCircle2,
  Loader2,
  UtensilsCrossed,
} from "lucide-react";
import type { PedidoData } from "@/core/types/domain";

interface PedidoCardProps {
  pedido: PedidoData;
  onUpdateStatus: (id: string, nuevoEstado: PedidoData["estado"]) => void;
  loadingId: string | null;
}

export function PedidoCard({
  pedido,
  onUpdateStatus,
  loadingId,
}: PedidoCardProps) {
  const isLoading = loadingId === pedido.id;

  return (
    <div className="admin-card overflow-hidden flex flex-col h-full !p-0 transition-all duration-300 hover:shadow-lg">
      {/* HEADER DE CANAL DE DESPACHO */}
      <div
        className={`px-5 py-3 border-b border-[var(--admin-border)] flex justify-between items-center transition-colors ${
          pedido.estado === "en_preparacion"
            ? "bg-[var(--admin-accent)]/5"
            : "bg-[var(--admin-surface)]/50"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--admin-text)]">
          {pedido.es_delivery ? (
            <Truck size={16} className="text-blue-500" />
          ) : (
            <Smartphone size={16} className="text-orange-500" />
          )}
          <span className="truncate max-w-[200px]">
            {pedido.es_delivery
              ? `Envío: ${pedido.direccion_entrega}`
              : "Retiro Local"}
          </span>
        </div>
        <span className="font-mono text-xs font-medium text-[var(--admin-text-muted)]">
          #{pedido.id.slice(0, 6)}
        </span>
      </div>

      {/* CUERPO DE DATOS */}
      <div className="p-5 space-y-5 flex-1">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="font-bold text-lg text-[var(--admin-text)] leading-tight mb-1">
              {pedido.cliente_nombre}
            </h4>
            <p className="text-xs text-[var(--admin-text-muted)] flex items-center gap-1.5">
              <span>
                {pedido.metodo_pago.replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>{" "}
              •{" "}
              <span className="font-semibold text-[var(--admin-accent)] text-sm">
                ${Number(pedido.total).toFixed(2)}
              </span>
            </p>
          </div>
          <a
            href={`https://wa.me/${pedido.cliente_whatsapp?.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-green-50/80 text-green-600 hover:bg-green-100 border border-green-200/60 transition-all duration-200 shrink-0 hover:shadow-sm hover:scale-105 active:scale-95"
            title="Contactar por WhatsApp"
          >
            <MessageCircle size={18} />
          </a>
        </div>

        {/* COMANDA INTERNA */}
        <div className="bg-[var(--admin-bg)]/50 rounded-2xl border border-[var(--admin-border)] p-4 space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] mb-2">
            <UtensilsCrossed size={14} />
            <span>Comanda</span>
          </div>
          <div className="space-y-3 divide-y divide-[var(--admin-border)] text-sm">
            {pedido.pedido_items?.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0">
                <div className="flex items-start gap-2">
                  <span className="bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] px-1.5 py-0.5 rounded-lg text-xs font-bold shrink-0">
                    {item.cantidad}x
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--admin-text)] leading-tight">
                      {item.nombre_producto}
                    </p>
                    {(() => {
                      if (!item.detalles) return null;
                      try {
                        const extras = JSON.parse(item.detalles);
                        if (Array.isArray(extras) && extras.length > 0) {
                          return (
                            <div className="mt-1 space-y-0.5">
                              {extras.map(
                                (e: Record<string, string>, ei: number) => (
                                  <p
                                    key={ei}
                                    className="text-[11px] text-[var(--admin-text-muted)]"
                                  >
                                    + {e["item_nombre"] || e["nombre"] || ""}
                                  </p>
                                ),
                              )}
                            </div>
                          );
                        }
                      } catch {
                        /* not JSON */
                      }
                      return (
                        <p className="text-xs text-[var(--admin-text-muted)] mt-1 bg-[var(--admin-surface)] p-2 rounded-lg border border-[var(--admin-border)] inline-block">
                          Nota: {item.detalles}
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {pedido.notas && (
          <div className="bg-amber-50/80 dark:bg-amber-950/15 rounded-2xl border border-amber-200/60 dark:border-amber-900/30 p-3 text-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 block mb-1">
              Aclaraciones extra
            </span>
            <p className="text-amber-900 dark:text-amber-300 leading-relaxed font-medium text-xs">
              {pedido.notas}
            </p>
          </div>
        )}
      </div>

      {/* CONTROLADORES DE ESTADO */}
      <div className="p-4 bg-[var(--admin-bg)]/30 border-t border-[var(--admin-border)] flex gap-3">
        {pedido.estado === "pendiente" ? (
          <>
            <button
              onClick={() => onUpdateStatus(pedido.id, "cancelado")}
              disabled={isLoading}
              className="btn-danger flex-1"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <XCircle size={16} />
              )}
              Rechazar
            </button>
            <button
              onClick={() => onUpdateStatus(pedido.id, "en_preparacion")}
              disabled={isLoading}
              className="btn-primary flex-[2]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Check size={16} />
              )}
              Preparar
            </button>
          </>
        ) : (
          <button
            onClick={() => onUpdateStatus(pedido.id, "entregado")}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 bg-[var(--admin-text)] text-white hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-md"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            Marcar como Entregado
          </button>
        )}
      </div>
    </div>
  );
}
