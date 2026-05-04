"use client";

import { useState } from "react";
import { actualizarEstadoPedido } from "@/app/actions/pedidos";
import {
  MapPin,
  Phone,
  MessageSquare,
  Check,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export function PedidoCard({ pedido }: { pedido: any }) {
  const [isPending, setIsPending] = useState(false);

  const handleEstado = async (nuevoEstado: string) => {
    setIsPending(true);
    try {
      const res = await actualizarEstadoPedido(pedido.id, nuevoEstado);
      if (res.success) {
        toast.success(`ESTADO ACTUALIZADO: ${nuevoEstado.toUpperCase()}`);
      } else {
        toast.error("Error al actualizar estado", { description: res.error });
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsPending(false);
    }
  };

  const statusColors: any = {
    pendiente: "border-amber-500 text-amber-600 bg-amber-50/50",
    preparando: "border-blue-500 text-blue-600 bg-blue-50/50",
    enviado: "border-purple-500 text-purple-600 bg-purple-50/50",
    entregado: "border-emerald-500 text-emerald-600 bg-emerald-50/50",
    cancelado: "border-error text-error bg-error/5",
  };

  return (
    <div className="bg-white dark:bg-bg-darker border-2 border-border rounded-super overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all animate-in fade-in zoom-in-95">
      {/* Header del Ticket */}
      <div
        className={`p-4 border-b-2 flex justify-between items-center ${statusColors[pedido.estado] || "border-border"}`}
      >
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
            ID: {pedido.id.slice(0, 8)}
          </p>
          <h3 className="font-black italic uppercase text-lg leading-none mt-1 tracking-tighter">
            {pedido.cliente_nombre}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">
            {pedido.metodo_pago}
          </p>
          <p className="font-black text-xl italic tracking-tighter">
            $
            {Number(pedido.total).toLocaleString("es-AR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Cuerpo del Pedido */}
      <div className="p-5 space-y-4 flex-1 bg-white dark:bg-transparent">
        <div className="space-y-2">
          {pedido.pedido_items?.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between text-xs font-bold uppercase italic tracking-tight"
            >
              <span className="text-text-muted">
                {item.cantidad}x {item.nombre_producto}
              </span>
              <span className="font-black">
                $
                {(item.precio_unitario * item.cantidad).toLocaleString("es-AR")}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t-2 border-dashed border-border space-y-3">
          {/* WhatsApp Directo */}
          <a
            href={`https://wa.me/${pedido.cliente_whatsapp?.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase hover:text-primary transition-colors group"
          >
            <Phone size={12} className="text-primary" />
            {pedido.cliente_whatsapp}
            <ExternalLink
              size={10}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </a>

          {pedido.es_delivery && (
            <div className="flex items-start gap-2 text-[10px] font-black text-text-muted uppercase italic">
              <MapPin size={12} className="text-primary mt-0.5 shrink-0" />
              <span className="leading-tight">{pedido.direccion_entrega}</span>
            </div>
          )}

          {pedido.notas && (
            <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-neo text-[10px] font-bold text-text-muted italic border border-border/50">
              <MessageSquare size={12} className="shrink-0 text-primary" />
              <span>"{pedido.notas}"</span>
            </div>
          )}
        </div>
      </div>

      {/* Acciones de Estado */}
      <div className="p-4 bg-gray-50 dark:bg-white/5 border-t-2 border-border grid grid-cols-2 gap-2">
        {pedido.estado === "pendiente" && (
          <button
            onClick={() => handleEstado("preparando")}
            disabled={isPending}
            className="col-span-2 bg-black text-white py-4 rounded-neo font-black uppercase italic text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:invert transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                ACEPTAR PEDIDO <ChevronRight size={14} />
              </>
            )}
          </button>
        )}

        {pedido.estado === "preparando" && (
          <button
            onClick={() =>
              handleEstado(pedido.es_delivery ? "enviado" : "entregado")
            }
            disabled={isPending}
            className="col-span-2 bg-primary text-white py-4 rounded-neo font-black uppercase italic text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                {pedido.es_delivery ? "DESPACHAR ENVÍO" : "LISTO PARA RETIRAR"}
                <Check size={16} strokeWidth={3} />
              </>
            )}
          </button>
        )}

        {pedido.estado !== "entregado" && pedido.estado !== "cancelado" && (
          <button
            onClick={() => handleEstado("cancelado")}
            disabled={isPending}
            className="col-span-2 mt-1 py-2 text-[10px] font-black uppercase text-error hover:underline transition-all disabled:opacity-30"
          >
            RECHAZAR PEDIDO
          </button>
        )}
      </div>
    </div>
  );
}
