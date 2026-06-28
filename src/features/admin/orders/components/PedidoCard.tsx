"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaWhatsapp } from "react-icons/fa";
import {
  Smartphone,
  Truck,
  XCircle,
  CheckCircle2,
  UtensilsCrossed,
  Clock,
  Circle,
  Printer,
  MoreVertical,
  AlertTriangle,
  Undo2,
  ChefHat,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { FoodMini } from "@/components/ui/food-loading";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useScrollLock } from "@/core/hooks/useScrollLock";
import type { PedidoData } from "@/core/types/domain";
import { ComandaPrintView, injectPrintStyles } from "./ComandaPrintView";

const STATUS_CONFIG = {
  pendiente: {
    label: "Pendiente",
    border: "border-l-blue-500",
    headerBg: "bg-blue-500/5",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dot: "text-blue-500",
    hoverBorder: "hover:border-l-blue-500/70",
  },
  en_preparacion: {
    label: "En Cocina",
    border: "border-l-amber-500",
    headerBg: "bg-amber-500/5",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dot: "text-amber-500",
    hoverBorder: "hover:border-l-amber-500/70",
  },
  entregado: {
    label: "Entregado",
    border: "border-l-green-500",
    headerBg: "bg-green-500/5",
    badgeBg: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    dot: "text-green-500",
    hoverBorder: "hover:border-l-green-500/70",
  },
  cancelado: {
    label: "Cancelado",
    border: "border-l-red-500",
    headerBg: "bg-red-500/5",
    badgeBg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
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
  const [notasExpanded, setNotasExpanded] = useState(false);
  const [showComandaModal, setShowComandaModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [comandaExpanded, setComandaExpanded] = useState(false);
  const [floatToast, setFloatToast] = useState<{ message: string; icon: string; key: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Comanda-#${pedido.id.slice(0, 6)}`,
    onBeforePrint: useCallback(() => {
      injectPrintStyles();
      return Promise.resolve();
    }, []),
    pageStyle: `
      @page { size: 80mm auto; margin: 0; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  });
  const style = STATUS_CONFIG[pedido.estado];
  const MAX_VISIBLE_ITEMS = 6;
  const comandaItems = pedido.pedido_items ?? [];
  const hasMoreItems = comandaItems.length > MAX_VISIBLE_ITEMS;
  const visibleItems = hasMoreItems
    ? comandaItems.slice(0, MAX_VISIBLE_ITEMS)
    : comandaItems;

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

  useScrollLock(showComandaModal);

  const isUrgent = pedido.estado === "pendiente" && (() => {
    const diff = Date.now() - new Date(pedido.created_at).getTime();
    return diff > 15 * 60_000;
  })();

  const triggerFloatToast = useCallback((message: string, icon: string) => {
    setFloatToast({ message, icon, key: Date.now() });
    setTimeout(() => setFloatToast(null), 2000);
  }, []);

  return (
    <>
      {/* Hidden print receipt */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <ComandaPrintView ref={printRef} pedido={pedido} />
      </div>
      <div
        className={`admin-card overflow-hidden flex flex-col h-full !p-0 transition-all duration-300 hover:shadow-lg border-l-4 ${style.border} ${style.hoverBorder} ${
          isUrgent ? "ring-2 ring-red-400/40" : ""
        }`}
      >
        {/* HEADER */}
        <div
          className={`px-3 sm:px-4 py-2 border-b border-[var(--admin-border)] flex justify-between items-center transition-colors ${style.headerBg}`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--admin-text)] min-w-0">
            {pedido.es_delivery ? (
              <Truck size={14} className="text-[var(--admin-accent)] shrink-0" />
            ) : (
              <Smartphone size={14} className="text-[var(--admin-accent-secondary)] shrink-0" />
            )}
            <span className="truncate max-w-[160px] sm:max-w-[200px]">
              {pedido.es_delivery ? "Envío" : "Retiro Local"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
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

            {/* Print button — visible */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 transition-all"
              aria-label="Imprimir comanda"
              title="Imprimir comanda"
            >
              <Printer size={14} />
            </button>

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
                      handlePrint();
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
        <div className="p-3 sm:p-4 space-y-3 flex-1">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h4 className="font-bold text-base text-[var(--admin-text)] leading-tight mb-0.5">
                {pedido.cliente_nombre}
              </h4>
              {pedido.es_delivery && pedido.direccion_entrega && (
                <p className="text-[11px] text-[var(--admin-text-muted)] mb-0.5 flex items-center gap-1">
                  <Truck size={12} />
                  {pedido.direccion_entrega}
                </p>
              )}
              <p className="text-[11px] text-[var(--admin-text-muted)] flex items-center gap-1">
                <span>
                  {pedido.metodo_pago.replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>{" "}
                •{" "}
                <span className="font-semibold admin-accent-text text-xs">
                  ${Number(pedido.total).toFixed(2)}
                </span>
              </p>
            </div>
            {pedido.cliente_whatsapp ? (
              <a
                href={`https://wa.me/${pedido.cliente_whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-xl bg-[var(--admin-success-bg)] text-[var(--admin-success)] hover:bg-opacity-90 border border-[var(--admin-success-border)] transition-all duration-200 shrink-0 hover:shadow-sm hover:scale-105 active:scale-95"
                title="Contactar por WhatsApp"
                aria-label={`Enviar WhatsApp a ${pedido.cliente_nombre}`}
              >
                <FaWhatsapp size={18} />
              </a>
            ) : null}
          </div>

          {/* COMANDA — LETRA GRANDE para cocina */}
          <div className="bg-[var(--admin-bg)]/50 rounded-xl border-2 border-[var(--admin-border)] p-3 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">
                <UtensilsCrossed size={14} />
                <span>Comanda</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-1 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-all"
                  title="Imprimir Comanda"
                >
                  <Printer size={13} />
                </button>
                {pedido.estado === "en_preparacion" && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(pedido.id, "pendiente")}
                    className="p-1 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-all"
                    title="Revertir a Pendiente"
                  >
                    <Undo2 size={13} />
                  </button>
                )}
                {pedido.estado === "entregado" && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(pedido.id, "en_preparacion")}
                    className="p-1 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-all"
                    title="Revertir a Preparación"
                  >
                    <Undo2 size={13} />
                  </button>
                )}
                {isUrgent && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded-full animate-pulse">
                    <AlertTriangle size={10} />
                    URGENTE
                  </span>
                )}
              </div>
            </div>
            {/* Toggle collapse */}
            <button
              type="button"
              onClick={() => setComandaExpanded(!comandaExpanded)}
              className="flex items-center justify-between w-full text-xs font-semibold text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors py-1"
            >
              <span className="flex items-center gap-2">
                {comandaExpanded ? "Ocultar productos" : `${comandaItems.length} producto${comandaItems.length !== 1 ? "s" : ""}`}
                <span className="text-[10px] opacity-60">· ${Number(pedido.total).toFixed(2)}</span>
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${comandaExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {comandaExpanded && (
              <div className="space-y-3 divide-y divide-[var(--admin-border)] animate-in slide-in-from-top-1 duration-150">
                {visibleItems.map((item) => {
                  const lineTotal = item.precio_unitario != null
                    ? item.cantidad * Number(item.precio_unitario)
                    : null;

                  // Parse detalles JSON into typed groups
                  let extrasByGroup: Array<{ titulo: string; items: { nombre: string; precio: number; cantidad: number }[] }> = [];
                  let notaCliente: string | null = null;
                  let variante: string | null = null;
                  let comboName: string | null = null;

                  if (item.detalles) {
                    try {
                      const parsed = JSON.parse(item.detalles);
                      if (Array.isArray(parsed)) {
                        const map = new Map<string, { nombre: string; precio: number; cantidad: number }[]>();
                        for (const e of parsed) {
                          const id = String(e.grupo_id ?? '');
                          const titulo = String(e.grupo_titulo ?? 'Otros');
                          const nombre = String(e.item_nombre ?? e.nombre ?? '');
                          const precio = Number(e.item_precio ?? 0);
                          const cantidad = Number(e.cantidad ?? 1);

                          if (id === '__nota__') { notaCliente = nombre; continue; }
                          if (id === '__variante__') { variante = nombre; continue; }
                          if (id === '__combo__') { comboName = nombre; continue; }

                          if (!map.has(titulo)) map.set(titulo, []);
                          map.get(titulo)!.push({ nombre, precio, cantidad });
                        }
                        extrasByGroup = Array.from(map.entries()).map(([titulo, items]) => ({ titulo, items }));
                      } else {
                        notaCliente = item.detalles;
                      }
                    } catch {
                      notaCliente = item.detalles;
                    }
                  }

                  const totalExtrasItems = extrasByGroup.reduce((acc, g) => acc + g.items.length, 0);

                  return (
                    <div key={item.id} className="pt-4 first:pt-0">
                      <div className="flex items-start gap-3">
                        <span className="bg-[var(--admin-accent)]/15 text-[var(--admin-accent)] px-2.5 py-1 rounded-xl text-lg font-black leading-none shrink-0 min-w-[40px] text-center">
                          {item.cantidad}x
                        </span>
                          <div className="flex-1 min-w-0">
                            {/* Combo badge */}
                            {/* Nombre del producto + variante + precio total */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-base sm:text-lg font-bold text-[var(--admin-text)] leading-tight">
                                  {item.nombre_producto}
                                  {variante && (
                                    <span className="ml-1 text-sm font-semibold text-[var(--admin-accent)]">
                                      ({variante})
                                    </span>
                                  )}
                                  {comboName && (
                                    <span className="ml-1.5 text-sm font-semibold text-[var(--admin-accent)]">
                                      ({comboName})
                                    </span>
                                  )}
                                </p>
                              {item.precio_unitario != null && (
                                <p className="text-[10px] text-[var(--admin-text-muted)] mt-0.5">
                                  ${Number(item.precio_unitario).toFixed(2)} c/u
                                </p>
                              )}
                            </div>
                            {lineTotal != null && (
                              <span className="shrink-0 text-xs font-black text-[var(--admin-accent)] tabular-nums">
                                ${lineTotal.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Extras grouped by category */}
                          {totalExtrasItems > 0 && (
                            <div className="mt-2 space-y-2 relative">
                            {/* Línea vertical decorativa en el costado izquierdo */}
                            <div className="absolute left-2 top-0 bottom-0 w-px bg-[var(--admin-border)]" />
                              {extrasByGroup.map((group) => (
                              <div key={group.titulo} className="relative pl-6">
                                {/* Bullet indicador del grupo */}
                                <span className="absolute left-[6px] top-[4px] w-[9px] h-[9px] rounded-full bg-[var(--admin-accent)]/20 border-2 border-[var(--admin-accent)]/40" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] mb-0.5">
                                    {group.titulo}
                                  </p>
                                  <div className="space-y-1">
                                  {group.items.map((extra, ei) => {
                                    const extraSubtotal = extra.precio * extra.cantidad;
                                    return (
                                      <div
                                        key={ei}
                                        className="flex items-center gap-1.5 text-xs font-medium text-[var(--admin-text-muted)]"
                                      >
                                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-md bg-[var(--admin-bg)] text-[9px] font-black text-[var(--admin-text-muted)] shrink-0">
                                            {extra.cantidad}
                                          </span>
                                          <span className="flex-1">{extra.nombre}</span>
                                        {extraSubtotal > 0 && (
                                          <span className="text-[10px] font-semibold text-[var(--admin-text)] tabular-nums">
                                              +${extraSubtotal.toFixed(2)}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Client note */}
                          {notaCliente && (
                            <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-2.5 py-2 text-xs">
                              <span className="shrink-0 mt-0.5 text-sm">📝</span>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-0.5">
                                  Nota del cliente
                                </p>
                                <p className="italic font-semibold text-amber-800 leading-snug">
                                  “{notaCliente}”
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {hasMoreItems && (
              <button
                type="button"
                onClick={() => setShowComandaModal(true)}
                className="w-full py-1.5 text-[10px] font-bold text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/5 rounded-xl border border-dashed border-[var(--admin-border)] transition-all"
              >
                Ver {comandaItems.length - MAX_VISIBLE_ITEMS} item{comandaItems.length - MAX_VISIBLE_ITEMS !== 1 ? "s" : ""} más
              </button>
            )}

            {/* N° de referencia siempre visible al final de la comanda */}
            <div className="pt-2 border-t border-[var(--admin-border)] flex items-center justify-between text-[10px] font-semibold text-[var(--admin-text-muted)]">
              <span>N° de referencia</span>
              <span className="font-mono font-black text-xs text-[var(--admin-text)]">
                #{pedido.id.slice(0, 8)}
              </span>
            </div>
          </div>

          {/* Modal de comanda expandida */}
          {showComandaModal && (
            <div
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200"
              onClick={() => setShowComandaModal(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                className="bg-[var(--admin-surface)] rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-[var(--admin-border)] animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--admin-text-muted)]">
                    <UtensilsCrossed size={18} />
                    <span>Comanda Completa</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowComandaModal(false)}
                    className="p-1.5 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-all"
                    aria-label="Cerrar"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-[var(--admin-text)]">
                    {pedido.cliente_nombre}
                    {pedido.es_delivery && pedido.direccion_entrega && (
                      <span className="block text-xs text-[var(--admin-text-muted)] font-normal mt-0.5">
                        🚚 {pedido.direccion_entrega}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 divide-y divide-[var(--admin-border)]">
                    {comandaItems.map((item) => {
                      const lineTotal = item.precio_unitario != null
                        ? item.cantidad * Number(item.precio_unitario)
                        : null;
                      // Parse detalles JSON into typed groups
                      let extrasByGroup: Array<{ titulo: string; items: { nombre: string; precio: number; cantidad: number }[] }> = [];
                      let notaCliente: string | null = null;
                      let variante: string | null = null;
                      let comboName: string | null = null;
                      if (item.detalles) {
                        try {
                          const parsed = JSON.parse(item.detalles);
                          if (Array.isArray(parsed)) {
                            const map = new Map<string, { nombre: string; precio: number; cantidad: number }[]>();
                            for (const e of parsed) {
                              const id = String(e.grupo_id ?? '');
                              const titulo = String(e.grupo_titulo ?? 'Otros');
                              const nombre = String(e.item_nombre ?? e.nombre ?? '');
                              const precio = Number(e.item_precio ?? 0);
                              const cantidad = Number(e.cantidad ?? 1);
                              if (id === '__nota__') { notaCliente = nombre; continue; }
                              if (id === '__variante__') { variante = nombre; continue; }
                              if (id === '__combo__') { comboName = nombre; continue; }
                              if (!map.has(titulo)) map.set(titulo, []);
                              map.get(titulo)!.push({ nombre, precio, cantidad });
                            }
                            extrasByGroup = Array.from(map.entries()).map(([titulo, items]) => ({ titulo, items }));
                          } else {
                            notaCliente = item.detalles;
                          }
                        } catch {
                          notaCliente = item.detalles;
                        }
                      }
                      const totalExtrasItems = extrasByGroup.reduce((acc, g) => acc + g.items.length, 0);

                      return (
                        <div key={item.id} className="pt-3 first:pt-0 flex items-start gap-3">
                          <span className="bg-[var(--admin-accent)]/15 text-[var(--admin-accent)] px-3 py-1 rounded-xl text-lg font-black leading-none shrink-0 min-w-[42px] text-center">
                            {item.cantidad}x
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[var(--admin-text)]">
                              {item.nombre_producto}
                              {variante && (
                                <span className="ml-1 text-sm font-semibold text-[var(--admin-accent)]">
                                  ({variante})
                                </span>
                              )}
                              {comboName && (
                                <span className="ml-1.5 text-sm font-semibold text-[var(--admin-accent)]">
                                  ({comboName})
                                </span>
                              )}
                            </p>
                            {item.precio_unitario != null && (
                              <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] mt-0.5">
                                <span>${Number(item.precio_unitario).toFixed(2)} c/u</span>
                                {lineTotal != null && (
                                  <>
                                    <span className="text-[var(--admin-border)]">•</span>
                                    <span className="font-semibold text-[var(--admin-text)]">
                                      ${lineTotal.toFixed(2)}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                            {totalExtrasItems > 0 && (
                              <div className="mt-2 space-y-1.5 relative">
                                <div className="absolute left-2 top-0 bottom-0 w-px bg-[var(--admin-border)]" />
                                {extrasByGroup.map((group) => (
                                  <div key={group.titulo} className="relative pl-6">
                                    <span className="absolute left-[5px] top-[5px] w-[9px] h-[9px] rounded-full bg-[var(--admin-accent)]/20 border-2 border-[var(--admin-accent)]/40" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] mb-0.5">
                                      {group.titulo}
                                    </p>
                                    <div className="space-y-0.5">
                                      {group.items.map((extra, ei) => {
                                        const extraSubtotal = extra.precio * extra.cantidad;
                                        return (
                                          <div key={ei} className="flex items-center gap-1.5 text-xs font-medium text-[var(--admin-text-muted)]">
                                            <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-[var(--admin-bg)] text-[9px] font-black text-[var(--admin-text-muted)] shrink-0">
                                              {extra.cantidad}
                                            </span>
                                            <span className="flex-1">{extra.nombre}</span>
                                            {extraSubtotal > 0 && (
                                              <span className="font-semibold text-[var(--admin-text)] tabular-nums">
                                                +${extraSubtotal.toFixed(2)}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {notaCliente && (
                              <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-2.5 py-2 text-xs">
                                <span className="shrink-0 mt-0.5 text-sm">📝</span>
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-0.5">
                                    Nota
                                  </p>
                                  <p className="italic font-semibold text-amber-800 leading-snug">
                                    “{notaCliente}”
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {pedido.notas && (() => {
            const isLong = pedido.notas.length > 80;
            return (
              <div className="rounded-xl p-3 text-xs" style={{ background: 'var(--admin-warning-bg)', border: '1px solid var(--admin-warning-border)' }}>
                <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: 'var(--admin-warning)' }}>
                  📝 Aclaraciones
                </span>
                <p className={`leading-relaxed font-semibold text-xs ${isLong && !notasExpanded ? 'line-clamp-2' : ''}`} style={{ color: 'var(--admin-warning)' }}>
                  {pedido.notas}
                </p>
                {isLong && (
                  <button
                    type="button"
                    onClick={() => setNotasExpanded(!notasExpanded)}
                    className="text-[10px] font-bold mt-1 underline hover:no-underline"
                    style={{ color: 'var(--admin-warning)' }}
                  >
                    {notasExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
            );
          })()}
        </div>

        {/* ACCIONES — solo botón principal */}
        <div className="p-2 sm:p-3 bg-[var(--admin-bg)]/30 border-t border-[var(--admin-border)]">
          {pedido.estado === "pendiente" ? (
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  onUpdateStatus(pedido.id, "en_preparacion");
                  triggerFloatToast("A cocina", "🍳");
                }}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 bg-amber-500 text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-md"
              >
                {isLoading ? <FoodMini size={16} /> : <ChefHat size={18} />}
                Preparar
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReject(true)}
                disabled={isLoading}
                className="flex items-center justify-center px-2.5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 text-red-600 bg-red-500/10 hover:bg-red-500/20 active:scale-[0.98] disabled:opacity-50 border border-red-500/20"
                title="Rechazar pedido"
              >
                <XCircle size={18} />
              </button>
            </div>
          ) : pedido.estado === "en_preparacion" ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    onUpdateStatus(pedido.id, "entregado");
                    triggerFloatToast("¡Listo! ✅", "✅");
                  }}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 bg-green-600 text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-md"
                >
                  {isLoading ? <FoodMini size={16} /> : <CheckCircle2 size={18} />}
                  Marcar listo
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmReject(true)}
                  disabled={isLoading}
                  className="flex items-center justify-center px-2.5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 text-red-600 bg-red-500/10 hover:bg-red-500/20 active:scale-[0.98] disabled:opacity-50 border border-red-500/20"
                  title="Cancelar pedido"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold text-[var(--admin-text-muted)] bg-[var(--admin-bg)]/50 border border-[var(--admin-border)]">
              <Circle size={8} fill="currentColor" className={style.dot} />
              Pedido {style.label.toLowerCase()}
            </div>
          )}
        </div>
      </div>

      {/* Floating toast — aparece en la zona de los botones y flota hacia arriba */}
      {floatToast && (
        <div
          key={floatToast.key}
          className="pointer-events-none fixed left-1/2 -translate-x-1/2 z-[9999] animate-float-up"
          style={{
            bottom: "120px",
          }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-lg text-xs font-bold text-[var(--admin-text)] backdrop-blur-sm">
            <span className="text-sm">{floatToast.icon}</span>
            <span>{floatToast.message}</span>
          </div>
        </div>
      )}

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
