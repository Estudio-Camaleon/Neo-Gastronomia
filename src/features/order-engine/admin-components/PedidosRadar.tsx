"use client";

import { useState, useMemo,} from "react";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  Search,
  ShoppingBag,
} from "lucide-react";
import { createClient } from "@/core/lib/supabase/client";
import { toast } from "sonner";
import { PedidoCard } from "./PedidoCard";
import { updateOrderStatusAction } from "../actions";
import { enviarNotificacionWhatsApp } from "@/core/lib/utils/whatsappActions";

export interface PedidoItem {
  id: string;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
  detalles?: string | null;
}

export interface PedidoData {
  id: string;
  estado: "pendiente" | "en_preparacion" | "entregado" | "cancelado";
  cliente_nombre: string;
  metodo_pago: string;
  total: number;
  cliente_whatsapp: string;
  es_delivery: boolean;
  direccion_entrega?: string | null;
  notas?: string | null;
  pedido_items: PedidoItem[];
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
  const [pedidos, setPedidos] = useState<PedidoData[]>(initialPedidos);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const supabase = createClient();

  

  const handleUpdateStatus = async (
    id: string,
    nuevoEstado: PedidoData["estado"],
  ) => {
    setLoadingId(id);
    const pedidoTarget = pedidos.find((p) => p.id === id);

    try {
      await updateOrderStatusAction(id, nuevoEstado);

      if (pedidoTarget) {
        enviarNotificacionWhatsApp(
          pedidoTarget as any,
          nuevoEstado,
          negocioNombre,
        );
      }
      toast.success("ESTADO SINCRONIZADO");
    } catch (error: any) {
      toast.error("FALLO DE RED", { description: error.message });
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
      label: "Nuevos",
      value: stats.nuevos,
      color: "bg-amber-400",
      icon: Clock,
    },
    {
      label: "En Cocina",
      value: stats.cocina,
      color: "bg-[#A3FF00]",
      icon: ShoppingCart,
    },
    {
      label: "Entregados",
      value: stats.listos,
      color: "bg-emerald-400",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6 font-sans text-black pb-12">
      {/* TARJETAS ANALÍTICAS DE MONITOREO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {radarItems.map((item, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden border-4 border-black p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <span className="font-mono font-black uppercase text-[10px] text-gray-400 block tracking-widest">
              Radar // {item.label}
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-4xl font-mono font-black">
                {item.value}
              </span>
              <div
                className={`w-3 h-3 border-2 border-black rounded-full ${item.color} animate-pulse`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* BARRA DE FILTRADO QUIRÚRGICO */}
      <div className="relative group w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
        <input
          type="text"
          placeholder="BUSCAR ORDEN POR NOMBRE DE COMPRADOR O ID..."
          className="w-full bg-white border-4 border-black p-4 pl-12 font-bold uppercase text-xs tracking-wider outline-none focus:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* GRILLA VIVA DE COMANDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pedidos
          .filter((p) => p.estado !== "entregado" && p.estado !== "cancelado")
          .filter(
            (p) =>
              p.cliente_nombre.toLowerCase().includes(filter.toLowerCase()) ||
              p.id.includes(filter),
          )
          .map((p) => (
            <PedidoCard
              key={p.id}
              pedido={p}
              onUpdateStatus={handleUpdateStatus}
              loadingId={loadingId}
            />
          ))}
      </div>

      {pedidos.filter(
        (p) => p.estado !== "entregado" && p.estado !== "cancelado",
      ).length === 0 && (
        <div className="py-20 text-center border-4 border-dashed border-black/20 bg-gray-50 flex flex-col items-center justify-center">
          <ShoppingBag className="text-gray-300 mb-2" size={32} />
          <p className="font-black font-mono text-xs uppercase text-gray-400 tracking-wider">
            0 Líneas de producción activas en este bloque.
          </p>
        </div>
      )}
    </div>
  );
}
