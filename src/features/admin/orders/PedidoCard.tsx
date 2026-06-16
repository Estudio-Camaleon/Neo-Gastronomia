"use client";

import { useState, useEffect, useRef } from "react";
import {
  Smartphone,
  Truck,
  MessageCircle,
  XCircle,
  Check,
  CheckCircle2,
  UtensilsCrossed,
  Clock,
  Circle,
  Printer,
  MoreVertical,
  AlertTriangle,
  Undo2,
} from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { PedidoData } from "@/core/types/domain";

const STATUS_CONFIG = {
  pendiente: {
    label: "Pendiente",
    border: "border-l-amber-500",
    headerBg: "bg-amber-500/5",
    badgeBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    dot: "text-amber-500",
    hoverBorder: "hover:border-l-amber-500/70",
  },
  en_preparacion: {
    label: "En Preparación",
    border: "border-l-[var(--admin-accent)]",
    headerBg: "bg-[var(--admin-accent)]/5",
    badgeBg: "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border-[var(--admin-accent)]/20",
    dot: "text-[var(--admin-accent)]",
    hoverBorder: "hover:border-l-[var(--admin-accent)]/70",
  },
  entregado: {
    label: "Entregado",
    border: "border-l-sky-500",
    headerBg: "bg-sky-500/5",
    badgeBg: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    dot: "text-sky-500",
    hoverBorder: "hover:border-l-sky-500/70",
  },
  cancelado: {
    label: "Cancelado",
    border: "border-l-red-500",
    headerBg: "bg-red-500/5",
    badgeBg: "bg-red-500/10 text-red-600 border-red-500/20",
    dot: "text-red-500",
    hoverBorder: "hover:border-l-red-500/70",
  },
} as const;

function formatElapsed(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "< 1 min";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

function printComanda(pedido: PedidoData): void {
  const itemsHtml = (pedido.pedido_items ?? [])
    .map(
      (item) =>
        `<tr>
          <td style="font-size:28px;font-weight:900;text-align:center;padding:8px 12px;background:#f5f5f5;border-radius:8px;">${item.cantidad}x</td>
          <td style="font-size:22px;font-weight:700;padding:8px 12px;">${item.nombre_producto}</td>
        </tr>`,
    )
    .join("");

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <html>
    <head><title>Comanda #${pedido.id.slice(0, 6)}</title>
    <style>
      body { font-family: 'Courier New', monospace; padding: 16px; max-width: 80mm; margin: 0 auto; }
      h1 { font-size: 20px; text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; }
      .cliente { font-size: 16px; font-weight: bold; margin: 8px 0; }
      .meta { font-size: 12px; color: #555; margin: 4px 0; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; }
      .footer { border-top: 1px dashed #000; padding-top: 8px; font-size: 11px; text-align: center; color: #888; margin-top: 12px; }
    </style>
    </head>
    <body>
      <h1>🍔 COMANDA</h1>
      <div class="cliente">${pedido.cliente_nombre}</div>
      <div class="meta">#${pedido.id.slice(0, 6)} · ${pedido.es_delivery ? "🚚 Envío" : "🏪 Retiro"} · ${pedido.metodo_pago}</div>
      <table>${itemsHtml}</table>
      ${pedido.notas ? `<div style="font-size:14px;font-weight:bold;color:#d97706;background:#fef3c7;padding:8px;border-radius:6px;">📝 ${pedido.notas}</div>` : ""}
      <div class="footer">${new Date().toLocaleString("es-AR")}</div>
      <script>window.print();window.close();</script>
    </body>
    </html>
  `);
  win.document.close();
}

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
  const [elapsed, setElapsed] = useState(() => formatElapsed(pedido.created_at));
  const [showConfirmReject, setShowConfirmReject] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const style = STATUS_CONFIG[pedido.estado];

  useEffect(() => {
    const tick = () => setElapsed(formatElapsed(pedido.created_at));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [pedido.created_at]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isUrgent = pedido.estado === "pendiente" && (() => {
    const diff = Date.now() - new Date(pedido.created_at).getTime();
    return diff > 15 * 60_000;
  })();

  return (
    <>
      <div
        className={`admin-card overflow-hidden flex flex-col h-full !p-0 transition-all duration-300 hover:shadow-lg border-l-4 ${style.border} ${style.hoverBorder} ${
          isUrgent ? "ring-2 ring-red-400/40" : ""
        }`}
      >
        {/* HEADER */}
        <div
          className={`px-4 sm:px-5 py-3 border-b border-[var(--admin-border)] flex justify-between items-center transition-colors ${style.headerBg}`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--admin-text)] min-w-0">
            {pedido.es_delivery ? (
              <Truck size={16} className="text-[var(--admin-accent)] shrink-0" />
            ) : (
              <Smartphone size={16} className="text-[var(--admin-accent-secondary)] shrink-0" />
            )}
            <span className="truncate max-w-[160px] sm:max-w-[200px]">
              {pedido.es_delivery
                ? `Envío: ${pedido.direccion_entrega}`
                : "Retiro Local"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider ${style.badgeBg} hidden sm:inline-flex`}
            >
              <Circle size={6} fill="currentColor" className={style.dot} />
              {style.label}
            </span>

            <span className="font-mono text-xs font-medium text-[var(--admin-text-muted)] flex items-center gap-2">
              <span className={`flex items-center gap-1 ${isUrgent ? "text-red-500 font-bold animate-pulse" : ""}`}>
                <Clock size={12} />
                {elapsed}
              </span>
              <span className="hidden xs:inline">#{pedido.id.slice(0, 6)}</span>
            </span>

            {/* 3-dot menu */}
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-all"
                aria-label="Más opciones"
                aria-expanded={menuOpen}
              >
                <MoreVertical size={15} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-xl py-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      printComanda(pedido);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-colors"
                  >
                    <Printer size={14} />
                    Imprimir Comanda
                  </button>
                  {pedido.estado === "pendiente" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setShowConfirmReject(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors"
                    >
                      <XCircle size={14} />
                      Rechazar Pedido
                    </button>
                  )}
                  {pedido.estado === "en_preparacion" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onUpdateStatus(pedido.id, "pendiente");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors"
                    >
                      <Undo2 size={14} />
                      Revertir a Pendiente
                    </button>
                  )}
                  {pedido.estado === "entregado" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onUpdateStatus(pedido.id, "en_preparacion");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors"
                    >
                      <Undo2 size={14} />
                      Revertir a Preparación
                    </button>
                  )}
                  {pedido.estado === "cancelado" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onUpdateStatus(pedido.id, "pendiente");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors"
                    >
                      <Undo2 size={14} />
                      Revertir a Pendiente
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CUERPO */}
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
                className="p-2 rounded-xl bg-[var(--admin-success-bg)] text-[var(--admin-success)] hover:bg-opacity-90 border border-[var(--admin-success-border)] transition-all duration-200 shrink-0 hover:shadow-sm hover:scale-105 active:scale-95"
                title="Contactar por WhatsApp"
                aria-label={`Enviar WhatsApp a ${pedido.cliente_nombre}`}
              >
                <MessageCircle size={18} />
              </a>
            ) : null}
          </div>

          {/* COMANDA — LETRA GRANDE para cocina */}
          <div className="bg-[var(--admin-bg)]/50 rounded-2xl border-2 border-[var(--admin-border)] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">
                <UtensilsCrossed size={16} />
                <span>Comanda</span>
              </div>
              {isUrgent && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-500/10 px-2 py-1 rounded-full animate-pulse">
                  <AlertTriangle size={12} />
                  URGENTE
                </span>
              )}
            </div>
            <div className="space-y-4 divide-y divide-[var(--admin-border)]">
              {pedido.pedido_items?.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0">
                  <div className="flex items-start gap-3">
                    <span className="bg-[var(--admin-accent)]/15 text-[var(--admin-accent)] px-3 py-1.5 rounded-xl text-xl font-black leading-none shrink-0 min-w-[48px] text-center">
                      {item.cantidad}x
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg sm:text-xl font-bold text-[var(--admin-text)] leading-tight">
                        {item.nombre_producto}
                      </p>
                      {item.precio_unitario != null && (
                        <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                          ${Number(item.precio_unitario).toFixed(2)} c/u
                        </p>
                      )}
                      {(() => {
                        if (!item.detalles) return null;
                        try {
                          const extras = JSON.parse(item.detalles);
                          if (Array.isArray(extras) && extras.length > 0) {
                            return (
                              <div className="mt-2 space-y-1">
                                {extras.map(
                                  (e: Record<string, string>, ei: number) => (
                                    <p
                                      key={ei}
                                      className="text-sm font-medium text-[var(--admin-text-muted)]"
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
                          <p className="text-sm font-medium text-[var(--admin-text-muted)] mt-1 bg-[var(--admin-surface)] p-2 rounded-lg border border-[var(--admin-border)] inline-block">
                            📝 {item.detalles}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* N° de referencia siempre visible al final de la comanda */}
            <div className="pt-3 border-t border-[var(--admin-border)] flex items-center justify-between text-xs font-semibold text-[var(--admin-text-muted)]">
              <span>N° de referencia</span>
              <span className="font-mono font-black text-sm text-[var(--admin-text)]">
                #{pedido.id.slice(0, 8)}
              </span>
            </div>
          </div>

          {pedido.notas && (
            <div className="rounded-2xl p-4 text-sm" style={{ background: 'var(--admin-warning-bg)', border: '1px solid var(--admin-warning-border)' }}>
              <span className="text-[10px] font-black uppercase tracking-widest block mb-1.5" style={{ color: 'var(--admin-warning)' }}>
                📝 Aclaraciones extra
              </span>
              <p className="leading-relaxed font-semibold text-sm" style={{ color: 'var(--admin-warning)' }}>
                {pedido.notas}
              </p>
            </div>
          )}
        </div>

        {/* ACCIONES — solo botón principal */}
        <div className="p-3 sm:p-4 bg-[var(--admin-bg)]/30 border-t border-[var(--admin-border)]">
          {pedido.estado === "pendiente" ? (
            <button
              onClick={() => onUpdateStatus(pedido.id, "en_preparacion")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-base font-bold tracking-wide transition-all duration-200 bg-[var(--admin-accent)] text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-md"
            >
              {isLoading ? <FoodMini size={18} /> : <Check size={20} />}
              Preparar
            </button>
          ) : pedido.estado === "en_preparacion" ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onUpdateStatus(pedido.id, "entregado")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-base font-bold tracking-wide transition-all duration-200 bg-black/85 dark:bg-white/85 text-white dark:text-black hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-md"
              >
                {isLoading ? <FoodMini size={18} /> : <CheckCircle2 size={20} />}
                {pedido.es_delivery ? "¿Listo para enviar?" : "¿Listo para entregar?"}
              </button>
              <button
                onClick={() => {
                  setShowConfirmReject(true);
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 text-red-600 bg-red-500/5 hover:bg-red-500/15 active:scale-[0.98] border border-red-500/20 disabled:opacity-50"
              >
                <XCircle size={16} />
                Cancelar pedido
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-[var(--admin-text-muted)] bg-[var(--admin-bg)]/50 border border-[var(--admin-border)]">
              <Circle size={10} fill="currentColor" className={style.dot} />
              Pedido {style.label.toLowerCase()}
            </div>
          )}
        </div>
      </div>

      {showConfirmReject && (
        <ConfirmModal
          title={pedido.estado === "pendiente" ? "Rechazar pedido" : "Cancelar pedido"}
          message={`¿Estás seguro de ${pedido.estado === "pendiente" ? "rechazar" : "cancelar"} el pedido de ${pedido.cliente_nombre}? Esta acción no se puede deshacer.`}
          confirmLabel={pedido.estado === "pendiente" ? "Sí, rechazar" : "Sí, cancelar"}
          cancelLabel="No, volver"
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
