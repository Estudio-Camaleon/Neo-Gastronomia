"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Clock,
  CheckCircle2,
  Search,
  ShoppingBag,
  BellDot,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  List,
  Filter,
} from "lucide-react";
import { createClient } from "@/core/lib/supabase/client";
import { toast } from "sonner";
import { PedidoCard } from "./PedidoCard";
import { updateOrderStatusAction } from "./actions";
import { enviarNotificacionWhatsApp } from "@/core/lib/utils/whatsappActions";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { PedidoItem, PedidoData } from "@/core/types/domain";

const supabase = createClient();

let audioBufferCache: AudioBuffer | null = null;

async function playSound() {
  try {
    const ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
    if (ctx.state === "suspended") await ctx.resume();

    if (!audioBufferCache) {
      const res = await fetch("/sounds/new-order.mp3");
      const buf = await res.arrayBuffer();
      audioBufferCache = await ctx.decodeAudioData(buf);
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBufferCache;
    source.connect(ctx.destination);
    source.start();
  } catch {
    // audio no crítico
  }
}

interface PedidosRadarProps {
  initialPedidos: PedidoData[];
  negocioId: string;
  negocioNombre: string;
}

export function PedidosRadar({
  initialPedidos,
  negocioId,
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
    () =>
      pedidosActivos
        .filter((p) =>
          statusFilter === "todos" ? true : p.estado === statusFilter,
        )
        .filter(
          (p) =>
            p.cliente_nombre
              .toLowerCase()
              .includes(debouncedFilter.toLowerCase()) ||
            p.id.includes(debouncedFilter),
        ),
    [pedidosActivos, debouncedFilter, statusFilter],
  );

  const itemsPerPage = showAll ? pedidosFiltrados.length : ORDERS_PER_PAGE;
  const totalPages = Math.max(
    1,
    Math.ceil(pedidosFiltrados.length / itemsPerPage),
  );
  const pedidosPagina = pedidosFiltrados.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage,
  );

  useEffect(() => {
    const channel = supabase
      .channel(`live-radar-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        async (
          payload: RealtimePostgresChangesPayload<{
            id: string;
            estado: PedidoData["estado"];
            cliente_nombre?: string | null;
          }>,
        ) => {
          if (payload.eventType === "INSERT" && payload.new) {
            const { data: fullPedido } = await supabase
              .from("pedidos")
              .select("*, pedido_items(*)")
              .eq("id", payload.new.id)
              .single();

            if (fullPedido) {
              setPedidos((prev) => [
                fullPedido as unknown as PedidoData,
                ...prev,
              ]);

              playSound();

              toast.info("Nuevo pedido entrante", {
                icon: <BellDot className="text-blue-500 animate-pulse" />,
                description: `Cliente: ${fullPedido.cliente_nombre || "Anónimo"}`,
              });
            }
          } else if (payload.eventType === "UPDATE" && payload.new) {
            setPedidos((prev) =>
              prev.map((p) =>
                p.id === payload.new.id
                  ? { ...p, estado: payload.new.estado }
                  : p,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [negocioId, supabase]);

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
            pedidoAfectado as unknown as Parameters<
              typeof enviarNotificacionWhatsApp
            >[0],
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
    }),
    [pedidos],
  );

  const radarItems = [
    {
      label: "Nuevos Pendientes",
      value: stats.nuevos,
      color: "bg-blue-500",
      glow: "shadow-blue-500/20",
      border: "border-blue-200/60 dark:border-blue-900/30",
      icon: Clock,
      textColor: "text-blue-600 dark:text-blue-400",
      bgLight: "bg-blue-50/50 dark:bg-blue-950/10",
    },
    {
      label: "En Cocina",
      value: stats.cocina,
      color: "bg-amber-500",
      glow: "shadow-amber-500/20",
      border: "border-amber-200/60 dark:border-amber-900/30",
      icon: ChefHat,
      textColor: "text-amber-600 dark:text-amber-400",
      bgLight: "bg-amber-50/50 dark:bg-amber-950/10",
    },
    {
      label: "Entregados",
      value: stats.listos,
      color: "bg-green-500",
      glow: "shadow-green-500/20",
      border: "border-green-200/60 dark:border-green-900/30",
      icon: CheckCircle2,
      textColor: "text-green-600 dark:text-green-400",
      bgLight: "bg-green-50/50 dark:bg-green-950/10",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {radarItems.map((item, idx) => (
          <div
            key={idx}
            className={`admin-card !p-5 border ${item.border} transition-all duration-300 rounded-2xl hover:shadow-lg ${item.glow}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--admin-text-muted)]">
                {item.label}
              </span>
              <div
                className={`p-2 rounded-xl ${item.bgLight} ${item.textColor} transition-all duration-200`}
              >
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

      <div className="admin-card !p-1 flex items-center">
        <div className="pl-4 pr-3 text-[var(--admin-text-muted)]">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar pedido por cliente o código..."
          className="admin-input !border-none !shadow-none !bg-transparent"
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

      {pedidosActivos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 admin-card border-dashed">
          <div className="p-4 rounded-2xl bg-[var(--admin-accent)]/5 text-[var(--admin-text-muted)] mb-4">
            <ShoppingBag size={48} strokeWidth={1.5} />
          </div>
          <p className="text-lg font-black tracking-tight text-[var(--admin-text)] mb-1">
            Radar despejado
          </p>
          <p className="text-sm font-medium text-[var(--admin-text-muted)]">
            No hay pedidos activos en este momento.
          </p>
        </div>
      )}
    </div>
  );
}
