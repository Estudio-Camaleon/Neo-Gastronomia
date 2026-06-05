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
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { PedidoCard } from "./PedidoCard";
import { updateOrderStatusAction } from "./actions";
import { enviarNotificacionWhatsApp } from "@/core/lib/utils/whatsappActions";
import { useOrderNotifications } from "./OrderNotificationProvider";
import type { PedidoData } from "@/core/types/domain";

interface PedidosRadarProps {
  initialPedidos: PedidoData[];
  negocioIds: string[];
  negocioNombre: string;
}

export function PedidosRadar({
  initialPedidos,
  negocioIds,
  negocioNombre,
}: PedidosRadarProps) {
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [showAll, setShowAll] = useState(false);
  const [pedidos, setPedidos] = useState<PedidoData[]>(initialPedidos);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set(initialPedidos.map((p) => p.id)));
  const { latestNewPedido, latestUpdateEvent, acknowledgeNewOrders, acknowledgeUpdateEvent } = useOrderNotifications();

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedFilter(filter);
      setPage(0);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [filter]);

  const ORDERS_PER_PAGE = 6;

  const pedidosActivos = useMemo(
    () =>
      pedidos.filter(
        (p) => p.estado !== "entregado" && p.estado !== "cancelado",
      ),
    [pedidos],
  );

  const pedidosFiltrados = useMemo(
    () => {
      const source = ["entregado", "cancelado"].includes(statusFilter)
        ? pedidos
        : pedidosActivos;
      return source
        .filter((p) =>
          statusFilter === "todos" ? true : p.estado === statusFilter,
        )
        .filter(
          (p) =>
            p.cliente_nombre
              .toLowerCase()
              .includes(debouncedFilter.toLowerCase()) ||
            p.id.includes(debouncedFilter),
        );
    },
    [pedidos, pedidosActivos, debouncedFilter, statusFilter],
  );

  const totalPages = showAll
    ? 1
    : Math.max(1, Math.ceil(pedidosFiltrados.length / ORDERS_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pedidosPagina = showAll
    ? pedidosFiltrados
    : pedidosFiltrados.slice(
        currentPage * ORDERS_PER_PAGE,
        (currentPage + 1) * ORDERS_PER_PAGE,
      );

  // ── Acknowledge pending notifications on mount ──
  useEffect(() => {
    acknowledgeNewOrders();
  }, [acknowledgeNewOrders]);

  // ── Watch for new pedidos from the global provider ──
  useEffect(() => {
    if (!latestNewPedido) return;
    const id = latestNewPedido.id;
    if (knownIdsRef.current.has(id)) return;
    knownIdsRef.current.add(id);
    setPedidos((prev) => [latestNewPedido, ...prev]);
  }, [latestNewPedido]);

  // ── Watch for UPDATE events from the global provider ──
  useEffect(() => {
    if (!latestUpdateEvent) return;
    const { id, estado } = latestUpdateEvent;
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: estado as PedidoData["estado"] } : p)),
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

      if (pedidoAfectado) {
        try {
          enviarNotificacionWhatsApp(
            pedidoAfectado,
            nuevoEstado,
            negocioNombre,
          );
        } catch {
          // notificación no crítica
        }
      }

      toast.success(`Pedido actualizado con éxito`);
    } catch {
      toast.error("Error en la sincronización con la base de datos");
    } finally {
      setLoadingId(null);
    }
  };

  const stats = useMemo(
    () => ({
      nuevos: pedidos.filter((p) => p.estado === "pendiente").length,
      cocina: pedidos.filter((p) => p.estado === "en_preparacion").length,
      listos: pedidos.filter((p) => p.estado === "entregado").length,
      cancelados: pedidos.filter((p) => p.estado === "cancelado").length,
    }),
    [pedidos],
  );

  const radarItems = [
    {
      label: "Nuevos Pendientes",
      value: stats.nuevos,
      color: "admin-accent-bg",
      glow: "shadow-blue-500/20",
      border: "border-[var(--admin-border)]",
      icon: Clock,
      textColor: "admin-accent-text",
      bgLight: "admin-accent-bg",
    },
    {
      label: "En Cocina",
      value: stats.cocina,
      color: "admin-warning-bg",
      glow: "shadow-amber-500/20",
      border: "border-[var(--admin-border)]",
      icon: ChefHat,
      textColor: "admin-warning-text",
      bgLight: "admin-warning-bg",
    },
    {
      label: "Entregados",
      value: stats.listos,
      color: "admin-success-bg",
      glow: "shadow-green-500/20",
      border: "border-[var(--admin-border)]",
      icon: CheckCircle2,
      textColor: "admin-success-text",
      bgLight: "admin-success-bg",
    },
    {
      label: "Cancelados",
      value: stats.cancelados,
      color: "bg-red-500",
      glow: "shadow-red-500/20",
      border: "border-[var(--admin-border)]",
      icon: XCircle,
      textColor: "text-red-600 dark:text-red-400",
      bgLight: "bg-red-50/50 dark:bg-red-950/10",
    },
  ];

  return (
    <div className="space-y-6 pb-12">

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {radarItems.map((item, idx) => (
          <div
            key={idx}
            className={`admin-card !p-5 ${item.border} transition-all duration-300 rounded-2xl hover:shadow-lg ${item.glow}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--admin-text-muted)]">
                {item.label}
              </span>
               <div className={`p-2 rounded-xl ${item.bgLight} ${item.textColor} transition-all duration-200`}>
                 <item.icon size={18} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-4xl font-black tracking-tight ${item.textColor}`}
              >
                {item.value}
              </span>
              {item.value > 0 && item.label !== "Entregados" && (
                <div
                  className={`w-2.5 h-2.5 rounded-full ${item.color} animate-pulse shadow-sm ${item.glow}`}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-1 bg-[var(--admin-bg)] p-1 rounded-xl border border-[var(--admin-border)]">
          {[
            { value: "todos", label: "Todos", icon: List },
            { value: "pendiente", label: "Pendientes", icon: Clock },
            { value: "en_preparacion", label: "En Cocina", icon: ChefHat },
            { value: "entregado", label: "Entregados", icon: CheckCircle2 },
            { value: "cancelado", label: "Cancelados", icon: XCircle },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === opt.value
                  ? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-xs border border-[var(--admin-border)]"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
              }`}
            >
              <opt.icon size={14} />
              {opt.label}
            </button>
          ))}
        </div>

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
          <Filter size={14} />
          {showAll ? "Ver paginado" : "Ver todos"}
        </button>
      </div>

      <div className="admin-card flex items-center p-2 gap-3">
        <div className="px-3 text-[var(--admin-text-muted)]">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar pedido por cliente o código..."
          className="flex-1 admin-input !border-none !shadow-none !bg-transparent"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

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

      {/* Paginación */}
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

      {pedidosFiltrados.length === 0 && (
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
              : "No se encontraron pedidos con este filtro."}
          </p>
        </div>
      )}
    </div>
  );
}
