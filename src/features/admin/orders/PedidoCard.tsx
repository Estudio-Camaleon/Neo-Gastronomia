"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  Truck,
  MessageCircle,
  XCircle,
  Check,
  CheckCircle2,
  UtensilsCrossed,
  Clock,
} from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { PedidoData } from "@/core/types/domain";

interface PedidoCardProps {
  pedido: PedidoData;
  onUpdateStatus: (id: string, nuevoEstado: PedidoData["estado"]) => void;
  loadingId: string | null;
}

function formatElapsed(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "< 1 min";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export function PedidoCard({
  pedido,
  onUpdateStatus,
  loadingId,
}: PedidoCardProps) {
  const isLoading = loadingId === pedido.id;
  const [elapsed, setElapsed] = useState(() => formatElapsed(pedido.created_at));
  const [showConfirmReject, setShowConfirmReject] = useState(false);

  useEffect(() => {
    const tick = () => setElapsed(formatElapsed(pedido.created_at));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [pedido.created_at]);

  const isUrgent = pedido.estado === "pendiente" && (() => {
    const diff = Date.now() - new Date(pedido.created_at).getTime();
    return diff > 15 * 60_000; // > 15 min
  })();

  return (
    <>
      <div className="admin-card overflow-hidden flex flex-col h-full !p-0 transition-all duration-300 hover:shadow-lg">
        {/* HEADER DE CANAL DE DESPACHO */}
        <div
          className={`px-4 sm:px-5 py-3 border-b border-[var(--admin-border)] flex justify-between items-center transition-colors ${
            pedido.estado === "en_preparacion"
              ? "bg-[var(--admin-accent)]/5"
              : "bg-[var(--admin-surface)]/50"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--admin-text)]">
            {pedido.es_delivery ? (
              <Truck size={16} className="text-[var(--admin-accent)]" />
            ) : (
              <Smartphone size={16} className="text-[var(--admin-accent-secondary)]" />
            )}
            <span className="truncate max-w-[200px]">
              {pedido.es_delivery
                ? `Envío: ${pedido.direccion_entrega}`
                : "Retiro Local"}
            </span>
          </div>
          <span className="font-mono text-xs font-medium text-[var(--admin-text-muted)] flex items-center gap-2">
            <span className={`flex items-center gap-1 ${isUrgent ? "text-red-500 font-bold" : ""}`}>
              <Clock size={12} />
              {elapsed}
            </span>
            <span>#{pedido.id.slice(0, 6)}</span>
          </span>
        </div>

        {/* CUERPO DE DATOS */}
        <div className="p-4 sm:p-5 space-y-5 flex-1">
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
              <span className="font-semibold admin-accent-text text-sm">
                  ${Number(pedido.total).toFixed(2)}
                </span>
              </p>
            </div>
            {pedido.cliente_whatsapp ? (
              <a
                href={`https://wa.me/${pedido.cliente_whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              className="p-2 rounded-xl bg-[var(--admin-success-bg)] text-[var(--admin-success)] dark:text-[var(--admin-success)] hover:bg-opacity-90 border border-[var(--admin-success-border)] dark:border-[var(--admin-success-border)] transition-all duration-200 shrink-0 hover:shadow-sm hover:scale-105 active:scale-95"
                title="Contactar por WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            ) : null}
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
                      {item.precio_unitario != null && (
                        <p className="text-[11px] text-[var(--admin-text-muted)] mt-0.5">
                          ${Number(item.precio_unitario).toFixed(2)} c/u → ${Number(item.precio_unitario * item.cantidad).toFixed(2)}
                        </p>
                      )}
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
                                      {e["item_precio"]
                                        ? ` ($${Number(e["item_precio"]).toFixed(2)})`
                                        : ""}
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
            <div className="rounded-2xl p-3 text-sm" style={{ background: 'var(--admin-warning-bg)', border: '1px solid var(--admin-warning-border)' }}>
              <span className="text-[10px] font-black uppercase tracking-widest block mb-1" style={{ color: 'var(--admin-warning)' }}>
                Aclaraciones extra
              </span>
              <p className="leading-relaxed font-medium text-xs" style={{ color: 'var(--admin-warning)' }}>
                {pedido.notas}
              </p>
            </div>
          )}
        </div>

        {/* CONTROLADORES DE ESTADO */}
        <div className="p-3 sm:p-4 bg-[var(--admin-bg)]/30 border-t border-[var(--admin-border)] flex gap-3">
          {pedido.estado === "pendiente" ? (
            <>
              <button
                onClick={() => setShowConfirmReject(true)}
                disabled={isLoading}
                className="btn-danger flex-1"
              >
                {isLoading ? <FoodMini size={14} /> : <XCircle size={16} />}
                Rechazar
              </button>
              <button
                onClick={() => onUpdateStatus(pedido.id, "en_preparacion")}
                disabled={isLoading}
                className="btn-primary flex-[2]"
              >
                {isLoading ? <FoodMini size={14} /> : <Check size={16} />}
                Preparar
              </button>
            </>
          ) : (
            <button
              onClick={() => onUpdateStatus(pedido.id, "entregado")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 bg-[var(--admin-text)] text-white  hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-md"
            >
              {isLoading ? <FoodMini size={16} /> : <CheckCircle2 size={18} />}
              Marcar como Entregado
            </button>
          )}
        </div>
      </div>

      {showConfirmReject && (
        <ConfirmModal
          title="Rechazar pedido"
          message={`¿Estás seguro de rechazar el pedido de ${pedido.cliente_nombre}? Esta acción no se puede deshacer.`}
          confirmLabel="Sí, rechazar"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={async () => {
            setShowConfirmReject(false);
            onUpdateStatus(pedido.id, "cancelado");
          }}
          onCancel={() => setShowConfirmReject(false)}
        />
      )}
    </>
  );
}
