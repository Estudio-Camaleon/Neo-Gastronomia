"use client";

import {
  Smartphone,
  Truck,
  MessageCircle,
  XCircle,
  Check,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { PedidoData } from "../PedidosRadar";

interface PedidoCardProps {
  pedido: PedidoData;
  onUpdateStatus: (id: string, nuevoEstado: PedidoData["estado"]) => void; // REQUERIDO
  loadingId: string | null; // REQUERIDO
}

export function PedidoCard({
  pedido,
  onUpdateStatus,
  loadingId,
}: PedidoCardProps) {
  const isLoading = loadingId === pedido.id;

  return (
    <div className="border-4 border-black rounded-neo bg-surface dark:bg-surface-dark overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-all hover:translate-y-[-2px]">
      {/* Header Dinámico según Estado */}
      <div
        className={`p-4 border-b-4 border-black flex justify-between items-center ${
          pedido.estado === "en_preparacion"
            ? "bg-primary/20"
            : "bg-amber-100 dark:bg-amber-900/20"
        }`}
      >
        <div className="flex items-center gap-2">
          {pedido.es_delivery ? <Truck size={16} /> : <Smartphone size={16} />}
          <span className="font-black uppercase italic text-xs tracking-tighter">
            {pedido.es_delivery
              ? `Envío: ${pedido.direccion_entrega}`
              : "Retiro en Local"}
          </span>
        </div>
        <span className="font-mono font-black text-[10px] opacity-40">
          #{pedido.id.slice(0, 8)}
        </span>
      </div>

      <div className="p-5 space-y-4 flex-1">
        {/* Info Cliente & WhatsApp */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-black text-2xl leading-none uppercase">
              {pedido.cliente_nombre}
            </p>
            <p className="text-xs font-bold text-text-muted mt-2 uppercase tracking-widest">
              {pedido.metodo_pago} •{" "}
              <span className="text-primary">${pedido.total}</span>
            </p>
          </div>
          <a
            href={`https://wa.me/${pedido.cliente_whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-green-500 text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all"
          >
            <MessageCircle size={18} />
          </a>
        </div>

        {/* Detalle de Comanda */}
        <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 border-2 border-black/5">
          <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-widest">
            Comanda:
          </p>
          <div className="space-y-2">
            {pedido.pedido_items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col border-b border-black/5 pb-1 last:border-0"
              >
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold">
                    <span className="text-primary mr-1">{item.cantidad}x</span>{" "}
                    {item.nombre_producto}
                  </span>
                </div>
                {item.detalles && (
                  <span className="text-[11px] text-text-muted italic ml-5 leading-tight">
                    ↳ {item.detalles}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notas del Cliente */}
        {pedido.notas && (
          <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border-2 border-dashed border-amber-200 dark:border-amber-700/30">
            <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
              Aclaraciones:
            </p>
            <p className="text-xs font-medium italic mt-1 leading-relaxed">
              "{pedido.notas}"
            </p>
          </div>
        )}
      </div>

      {/* Botones de Acción de Estado */}
      <div className="p-4 bg-bg-main dark:bg-bg-darker border-t-4 border-black grid grid-cols-2 gap-3 mt-auto">
        {pedido.estado === "pendiente" ? (
          <>
            <button
              onClick={() => onUpdateStatus(pedido.id, "cancelado")}
              disabled={isLoading}
              className="py-3 bg-white dark:bg-surface-dark border-2 border-black rounded-xl font-black uppercase italic text-[10px] flex items-center justify-center gap-2 hover:bg-red-50 text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <XCircle size={14} />
              )}
              Rechazar
            </button>
            <button
              onClick={() => onUpdateStatus(pedido.id, "en_preparacion")}
              disabled={isLoading}
              className="py-3 bg-primary text-white border-2 border-black rounded-xl font-black uppercase italic text-[10px] flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Check size={14} />
              )}
              Aceptar
            </button>
          </>
        ) : (
          <button
            onClick={() => onUpdateStatus(pedido.id, "entregado")}
            disabled={isLoading}
            className="col-span-2 py-3 bg-green-500 text-black border-2 border-black rounded-xl font-black uppercase italic text-[10px] flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}
            Marcar como Entregado
          </button>
        )}
      </div>
    </div>
  );
}
