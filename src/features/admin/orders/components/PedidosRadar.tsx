"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ShoppingBag,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  List,
  Calendar,
  Truck,
  Smartphone,
  AlertTriangle,
  PauseCircle,
  PlayCircle,

} from "lucide-react";
import { toast } from "sonner";
import { PedidoCard } from "./PedidoCard";
import {
  updateOrderStatusAction,
  toggleRecepcionPausadaAction,
} from "../actions";
import { enviarNotificacionWhatsApp } from "@/core/lib/utils/whatsappActions";
import { useOrderNotifications } from "./OrderNotificationProvider";
import { FoodMini } from "@/components/ui/food-loading";
import { useDebounce } from "@/core/hooks/useDebounce";
import { useUrgentStore } from "../urgent-store";
import { useNotifications } from "@/features/admin/notifications/NotificationProvider";
import type { PedidoData } from "@/core/types/domain";

interface PedidosRadarProps {
  initialPedidos: PedidoData[];
  negocioIds: string[];
  negocioNombre: string;
  panicModeInicial?: boolean;
  whatsappMensajes?: Record<string, string> | null;
}

const ORDERS_PER_PAGE = 24;

export function PedidosRadar({
  initialPedidos,
  negocioIds,
  negocioNombre,
  panicModeInicial = false,
  whatsappMensajes = null,
}: PedidosRadarProps) {
  const [filter, setFilter] = useState("");
  const debouncedFilter = useDebounce(filter);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [modalidadFilter, setModalidadFilter] = useState<string>("todas");
  const [dateFilter, setDateFilter] = useState<"today" | "7d" | "30d" | "all">("all");
  const [showAll, setShowAll] = useState(false);
  const [pedidos, setPedidos] = useState<PedidoData[]>(initialPedidos);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [panicMode, setPanicMode] = useState(panicModeInicial);
  const [panicLoading, setPanicLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const knownIdsRef = useRef<Set<string>>(
    new Set(initialPedidos.map((p) => p.id)),
  );
  const {
    latestNewPedido,
    latestUpdateEvent,
    acknowledgeNewOrders,
    acknowledgeUpdateEvent,
  } = useOrderNotifications();

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedFilter, statusFilter, modalidadFilter, dateFilter]);

  const pedidosActivos = useMemo(
    () =>
      pedidos.filter(
        (p) => p.estado !== "entregado" && p.estado !== "cancelado",
      ),
    [pedidos],
  );

  const pedidosFiltrados = useMemo(() => {
    let source = ["entregado", "cancelado"].includes(statusFilter)
      ? pedidos
      : pedidosActivos;

    const now = new Date();
    if (dateFilter === "today") {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      source = source.filter((p) => new Date(p.created_at) >= todayStart);
    } else if (dateFilter === "7d") {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      source = source.filter((p) => new Date(p.created_at) >= weekAgo);
    } else if (dateFilter === "30d") {
      const monthAgo = new Date(now.getTime() - 30 * 86400000);
      source = source.filter((p) => new Date(p.created_at) >= monthAgo);
    }

    // Modalidad filter
    if (modalidadFilter === "delivery") {
      source = source.filter((p) => p.es_delivery);
    } else if (modalidadFilter === "retiro") {
      source = source.filter((p) => !p.es_delivery);
    }

    return source
      .filter((p) =>
        statusFilter === "todos" ? true : p.estado === statusFilter,
      )
      .filter((p) => {
        if (!debouncedFilter) return true;
        const q = debouncedFilter.toLowerCase();
        return (
          p.cliente_nombre.toLowerCase().includes(q) ||
          p.id.includes(debouncedFilter) ||
          (p.cliente_whatsapp || "").includes(debouncedFilter) ||
          p.metodo_pago.toLowerCase().includes(q) ||
          (p.pedido_items || []).some((item) =>
            item.nombre_producto.toLowerCase().includes(q),
          )
        );
      });
  }, [
    pedidos,
    pedidosActivos,
    debouncedFilter,
    statusFilter,
    modalidadFilter,
    dateFilter,
  ]);

  // FIFO sort: oldest first. Urgent (pendiente >15min) bubble to absolute top.
  const pedidosOrdenados = useMemo(() => {
    const urgentes = pedidosFiltrados.filter((p) => {
      if (p.estado !== "pendiente") return false;
      return Date.now() - new Date(p.created_at).getTime() > 15 * 60_000;
    });
    const normales = pedidosFiltrados.filter((p) => {
      if (p.estado !== "pendiente") return true;
      return Date.now() - new Date(p.created_at).getTime() <= 15 * 60_000;
    });
    // Sort both groups FIFO (oldest first)
    const sortFifo = (a: PedidoData, b: PedidoData) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    urgentes.sort(sortFifo);
    normales.sort(sortFifo);
    return [...urgentes, ...normales];
  }, [pedidosFiltrados]);

  const totalPages = showAll
    ? 1
    : Math.max(1, Math.ceil(pedidosOrdenados.length / ORDERS_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pedidosPagina = showAll
    ? pedidosOrdenados
    : pedidosOrdenados.slice(
        currentPage * ORDERS_PER_PAGE,
        (currentPage + 1) * ORDERS_PER_PAGE,
      );

  const urgentCount = useMemo(
    () =>
      pedidos.filter(
        (p) =>
          p.estado === "pendiente" &&
          Date.now() - new Date(p.created_at).getTime() > 15 * 60_000,
      ).length,
    [pedidos],
  );

  // ── Sincronizar urgentCount con store global (campana + sonido + bandeja) ──
  const prevUrgentRef = useRef(urgentCount);
  const setUrgentCount = useUrgentStore((s) => s.setUrgentCount);
  const { addLocalNotification: addUrgentNotif, removeLocalNotification: removeUrgentNotif } = useNotifications();
  useEffect(() => {
    setUrgentCount(urgentCount);

    if (urgentCount > 0 && prevUrgentRef.current === 0) {
      import("../urgent-store").then(({ playUrgentAlert }) => playUrgentAlert());
      addUrgentNotif({
        id: "urgent-orders",
        title: `${urgentCount} pedido${urgentCount !== 1 ? "s" : ""} esperando más de 15 min`,
        body: "Revisá los pedidos pendientes con demora.",
        created_at: new Date().toISOString(),
        icon: "alert-triangle",
        color: "text-red-500",
        actions: [
          {
            label: "Ver pendientes",
            primary: true,
            onClick: () => setStatusFilter("pendiente"),
          },
        ],
      });
    } else if (urgentCount === 0 && prevUrgentRef.current > 0) {
      removeUrgentNotif("urgent-orders");
    }

    prevUrgentRef.current = urgentCount;
  }, [urgentCount, setUrgentCount, addUrgentNotif, removeUrgentNotif]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs, textareas, or when a modal is open
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;

      // Check no modal is open
      if (document.querySelector('[role="dialog"]')) return;

      const visiblePedidos = pedidosPagina.filter(
        (p) => p.estado === "pendiente" || p.estado === "en_preparacion",
      );
      if (visiblePedidos.length === 0) return;

      const first = visiblePedidos[0];
      switch (e.key) {
        case "1":
          if (first.estado === "pendiente") {
            e.preventDefault();
            handleUpdateStatus(first.id, "en_preparacion");
          }
          break;
        case "2":
          if (first.estado === "en_preparacion") {
            e.preventDefault();
            handleUpdateStatus(first.id, "entregado");
          }
          break;
        case "3":
          if (first.estado === "pendiente") {
            e.preventDefault();
            handleUpdateStatus(first.id, "cancelado");
          }
          break;
        case "s":
        case "S":
          if (e.metaKey || e.ctrlKey) break;
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case "t":
        case "T":
          e.preventDefault();
          setDateFilter((prev) => {
            const cycle: Array<"today" | "7d" | "30d" | "all"> = ["today", "7d", "30d", "all"];
            const idx = cycle.indexOf(prev);
            return cycle[(idx + 1) % cycle.length];
          });
          break;
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [pedidosPagina]);

  useEffect(() => {
    acknowledgeNewOrders();
  }, [acknowledgeNewOrders]);

  // FIFO: new orders go to the END of the list (oldest processed first)
  useEffect(() => {
    if (!latestNewPedido) return;
    const id = latestNewPedido.id;
    if (knownIdsRef.current.has(id)) return;
    knownIdsRef.current.add(id);
    setPedidos((prev) => [...prev, latestNewPedido]);
  }, [latestNewPedido]);

  useEffect(() => {
    if (!latestUpdateEvent) return;
    const { id, estado } = latestUpdateEvent;
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estado: estado as PedidoData["estado"] } : p,
      ),
    );
    acknowledgeUpdateEvent();
  }, [latestUpdateEvent, acknowledgeUpdateEvent]);

  const handleUpdateStatus = async (
    id: string,
    nuevoEstado: PedidoData["estado"],
  ) => {
    setLoadingId(id);
    const pedidoAfectado = pedidos.find((p) => p.id === id);

    try {
      await updateOrderStatusAction(id, nuevoEstado);

      // WhatsApp notification — log error but don't block
      if (pedidoAfectado) {
        try {
          enviarNotificacionWhatsApp(
            pedidoAfectado,
            nuevoEstado,
            negocioNombre,
            whatsappMensajes,
          );
        } catch (waErr) {
          console.error("WhatsApp notification failed:", waErr);
        }
      }

      toast.success(`Pedido actualizado con éxito`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de conexión";
      toast.error("Error al actualizar el pedido", { description: msg });
    } finally {
      setLoadingId(null);
    }
  };

  // ── Recordatorio de pedidos estancados en cocina → a la bandeja ──
  const STUCK_THRESHOLD_MS = 20 * 60_000; // 20 min
  const stuckRemindedRef = useRef<Set<string>>(new Set());
  const { addLocalNotification, removeLocalNotification } = useNotifications();

  useEffect(() => {
    const stuck = pedidos.filter((p) => {
      if (p.estado !== "en_preparacion") return false;
      const elapsed = Date.now() - new Date(p.created_at).getTime();
      return elapsed > STUCK_THRESHOLD_MS && !stuckRemindedRef.current.has(p.id);
    });

    if (stuck.length === 0) return;

    stuck.forEach((p) => {
      const notifId = `stuck-${p.id}`;
      stuckRemindedRef.current.add(p.id);

      addLocalNotification({
        id: notifId,
        title: `¿${p.cliente_nombre.split(" ")[0]} ya está listo?`,
        body: `Pedido en preparación hace ${Math.floor((Date.now() - new Date(p.created_at).getTime()) / 60_000)} min · #${p.id.slice(0, 6)}${p.es_delivery ? " · 🚚 Delivery" : " · 🏪 Retiro"}`,
        created_at: new Date().toISOString(),
        icon: "chef-hat",
        color: "text-amber-500",
        actions: [
          {
            label: "Marcar listo",
            primary: true,
            onClick: () => {
              handleUpdateStatus(p.id, "entregado");
              removeLocalNotification(notifId);
            },
          },
          {
            label: "Ahora no",
            primary: false,
            onClick: () => removeLocalNotification(notifId),
          },
        ],
      });
    });
  }, [pedidos, handleUpdateStatus, addLocalNotification, removeLocalNotification]);

  const statusCounts = useMemo(
    () => ({
      pendiente: pedidos.filter((p) => p.estado === "pendiente").length,
      en_preparacion: pedidos.filter((p) => p.estado === "en_preparacion").length,
      entregado: pedidos.filter((p) => p.estado === "entregado").length,
      cancelado: pedidos.filter((p) => p.estado === "cancelado").length,
      total: pedidos.length,
      delivery: pedidos.filter((p) => p.es_delivery).length,
      retiro: pedidos.filter((p) => !p.es_delivery).length,
    }),
    [pedidos],
  );

  const statusPills = [
    { value: "todos", label: "Todos", icon: List, count: statusCounts.total },
    { value: "pendiente", label: "Pendientes", icon: Clock, count: statusCounts.pendiente },
    { value: "en_preparacion", label: "En Cocina", icon: ChefHat, count: statusCounts.en_preparacion },
    { value: "entregado", label: "Entregados", icon: CheckCircle2, count: statusCounts.entregado },
    { value: "cancelado", label: "Cancelados", icon: XCircle, count: statusCounts.cancelado },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ── Alert banner for urgent orders ── */}
      {urgentCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 animate-in slide-in-from-top-2 duration-300">
          <AlertTriangle size={20} className="shrink-0 animate-pulse" />
          <div className="flex-1 text-sm font-bold">
            {urgentCount} pedido{urgentCount !== 1 ? "s" : ""} esperando más de
            15 min
          </div>
          <button
            onClick={() => setStatusFilter("pendiente")}
            className="text-xs font-bold underline hover:no-underline"
          >
            Ver ahora
          </button>
        </div>
      )}

      {/* ── Header row: title + panic button ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--admin-text)]">
            Recepción de pedidos
          </h2>
          <p className="text-xs text-[var(--admin-text-muted)] font-medium mt-0.5">
            Control de órdenes y despacho en tiempo real
          </p>
        </div>
        <button
          onClick={async () => {
            setPanicLoading(true);
            try {
              const { recepcion_pausada } =
                await toggleRecepcionPausadaAction();
              setPanicMode(recepcion_pausada);
            } catch {
              toast.error("Error al cambiar estado de recepción");
            } finally {
              setPanicLoading(false);
            }
          }}
          disabled={panicLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 ${
            panicMode
              ? "bg-red-500/10 text-red-600 border-red-500/30 animate-pulse"
              : "bg-[var(--admin-surface)] text-[var(--admin-text-muted)] border-[var(--admin-border)] hover:text-[var(--admin-text)]"
          }`}
          aria-pressed={panicMode}
        >
          {panicLoading ? (
            <FoodMini size={14} />
          ) : panicMode ? (
            <>
              <PlayCircle size={16} />
              Reanudar Recepción
            </>
          ) : (
            <>
              <PauseCircle size={16} />
              Pausar Recepción
            </>
          )}
        </button>
      </div>

      {/* ── Combined filter bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 bg-[var(--admin-bg)] p-1 rounded-xl border border-[var(--admin-border)]">
          {/* Status pills */}
          {statusPills.map((opt) => {
            const isActive = statusFilter === opt.value;
            const pillColor = (() => {
              if (opt.value === "todos") return null;
              const c: Record<string, { active: string; inactive: string; badge: string }> = {
                pendiente: {
                  active: "bg-blue-500/15 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300 shadow-xs border border-blue-500/30",
                  inactive: "text-blue-600 dark:text-blue-400 hover:bg-blue-500/5",
                  badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
                en_preparacion: {
                  active: "bg-amber-500/15 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 shadow-xs border border-amber-500/30",
                  inactive: "text-amber-600 dark:text-amber-400 hover:bg-amber-500/5",
                  badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
                entregado: {
                  active: "bg-green-500/15 dark:bg-green-500/25 text-green-700 dark:text-green-300 shadow-xs border border-green-500/30",
                  inactive: "text-green-600 dark:text-green-400 hover:bg-green-500/5",
                  badge: "bg-green-500/10 text-green-600 dark:text-green-400",
                },
                cancelado: {
                  active: "bg-red-500/15 dark:bg-red-500/25 text-red-700 dark:text-red-300 shadow-xs border border-red-500/30",
                  inactive: "text-red-600 dark:text-red-400 hover:bg-red-500/5",
                  badge: "bg-red-500/10 text-red-600 dark:text-red-400",
                },
              };
              return c[opt.value];
            })();

            const pillBase = isActive
              ? pillColor?.active ?? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-xs border border-[var(--admin-border)]"
              : pillColor?.inactive ?? "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]";

            const badgeBase = isActive
              ? pillColor?.badge ?? "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]"
              : pillColor?.badge ?? "bg-[var(--admin-bg)] text-[var(--admin-text-muted)]";

            return (
              <button
                key={opt.value}
                onClick={() => {
                  setStatusFilter(opt.value);
                  setPage(0);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${pillBase}`}
              >
                <opt.icon size={14} />
                <span>{opt.label}</span>
                <span className={`ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full leading-none ${badgeBase}`}>
                  {opt.count}
                </span>
              </button>
            );
          })}

          {/* Separator */}
          <div className="w-px bg-[var(--admin-border)] mx-1 self-stretch" />

          {/* Modalidad pills */}
          {[
            { value: "delivery", label: "Envíos", icon: Truck, count: statusCounts.delivery },
            { value: "retiro", label: "Retiro", icon: Smartphone, count: statusCounts.retiro },
          ].map((opt) => {
            const isActive = modalidadFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setModalidadFilter((prev) => (prev === opt.value ? "todas" : opt.value));
                  setPage(0);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isActive
                    ? opt.value === "delivery"
                      ? "bg-violet-500/15 dark:bg-violet-500/25 text-violet-700 dark:text-violet-300 shadow-xs border border-violet-500/30"
                      : "bg-teal-500/15 dark:bg-teal-500/25 text-teal-700 dark:text-teal-300 shadow-xs border border-teal-500/30"
                    : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                }`}
              >
                <opt.icon size={14} />
                <span>{opt.label}</span>
                <span className={`ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full leading-none ${
                  isActive
                    ? opt.value === "delivery"
                      ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                    : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)]"
                }`}>
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Date pills */}
        <div className="flex gap-1 bg-[var(--admin-bg)] p-1 rounded-xl border border-[var(--admin-border)]">
          {[
            { value: "today", label: "Hoy", icon: Calendar },
            { value: "7d", label: "7 días", icon: Calendar },
            { value: "30d", label: "30 días", icon: Calendar },
            { value: "all", label: "Todos", icon: Calendar },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setDateFilter(opt.value as typeof dateFilter);
                setPage(0);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                dateFilter === opt.value
                  ? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-xs border border-[var(--admin-border)]"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search — compacto */}
        <div className="flex items-center gap-1 bg-[var(--admin-bg)] p-1 rounded-xl border border-[var(--admin-border)] ml-auto">
          <Search size={14} className="text-[var(--admin-text-muted)] ml-2 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar…"
            className="w-[100px] sm:w-[140px] bg-transparent text-xs font-medium text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)]/50 outline-none border-none py-1"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filter && (
            <button
              type="button"
              onClick={() => setFilter("")}
              className="p-1 mr-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <XCircle size={14} />
            </button>
          )}
        </div>

        {/* Show all toggle */}
        <button
          onClick={() => {
            setShowAll(!showAll);
            setPage(0);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
            showAll
              ? "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border-[var(--admin-accent)]/30"
              : "border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
          }`}
        >
          <List size={14} />
          {showAll ? "Ver paginado" : "Ver todos"}
        </button>
      </div>

      {/* ── Cards grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {pedidosPagina.map((p) => (
          <PedidoCard
            key={p.id}
            pedido={p}
            onUpdateStatus={handleUpdateStatus}
            loadingId={loadingId}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-accent)]/5 hover:border-[var(--admin-accent)]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} /> Anterior
          </button>
          <span className="text-xs font-medium text-[var(--admin-text-muted)]">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-accent)]/5 hover:border-[var(--admin-accent)]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente <ChevronRight size={14} />
          </button>
        </div>
      )}

      {pedidosOrdenados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 admin-card border-dashed">
          <div className="p-4 rounded-2xl bg-[var(--admin-accent)]/5 text-[var(--admin-text-muted)] mb-4">
            <ShoppingBag size={48} strokeWidth={1.5} />
          </div>
          <p className="text-lg font-black tracking-tight text-[var(--admin-text)] mb-1">
            {["entregado", "cancelado"].includes(statusFilter)
              ? `Sin pedidos ${statusFilter === "entregado" ? "entregados" : "cancelados"}`
              : "Radar despejado"}
          </p>
          <p className="text-sm font-medium text-[var(--admin-text-muted)]">
            {pedidos.length === 0
              ? "Aún no hay pedidos registrados."
              : dateFilter === "today"
                ? "No hay pedidos para hoy con este filtro."
                : "No se encontraron pedidos con este filtro."}
          </p>
        </div>
      )}
    </div>
  );
}
