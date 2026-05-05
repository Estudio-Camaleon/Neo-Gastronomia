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

interface PedidoItem {
  id: string;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
}

interface PedidoData {
  id: string;
  estado:
    | "pendiente"
    | "preparando"
    | "preparacion"
    | "enviado"
    | "entregado"
    | "cancelado"; // Sincronizado con "preparacion"
  cliente_nombre: string;
  metodo_pago?: string | null;
  total: number | string;
  cliente_whatsapp: string;
  es_delivery: boolean;
  direccion_entrega?: string | null;
  notas?: string | null;
  pedido_items: PedidoItem[];
}

interface PedidoCardProps {
  pedido: PedidoData;
}

export function PedidoCard({ pedido }: PedidoCardProps) {
  const [isPending, setIsPending] = useState(false);

  const handleEstado = async (nuevoEstado: PedidoData["estado"]) => {
    setIsPending(true);
    try {
      const res = await actualizarEstadoPedido(pedido.id, nuevoEstado);
      if (res.success) {
        toast.success(`ESTADO ACTUALIZADO: ${nuevoEstado.toUpperCase()}`);
      } else {
        toast.error("Error al actualizar estado", { description: res.error });
      }
    } catch {
      toast.error("Error de conexión con el radar");
    } finally {
      setIsPending(false);
    }
  };

  // Paleta indexada estricta adaptada a la estética Neo-Brutalista (Admite ambas variantes por seguridad)
  const statusColors: Record<PedidoData["estado"], string> = {
    pendiente:
      "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/10",
    preparando:
      "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10",
    preparacion:
      "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10",
    enviado:
      "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-500/10",
    entregado:
      "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10",
    cancelado: "border-error text-error bg-error/5 dark:bg-error/10",
  };

  return (
    <div className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all animate-in fade-in zoom-in-95 font-sans h-full">
      {/* Encabezado del Ticket de Comanda */}
      <div
        className={`p-4 border-b-2 flex justify-between items-center transition-colors ${statusColors[pedido.estado] || "border-border dark:border-border-dark"}`}
      >
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 font-mono">
            ID: {pedido.id.slice(0, 8)}
          </p>
          <h3 className="font-black italic uppercase text-lg leading-none mt-1 tracking-tighter text-text-primary dark:text-text-inverse">
            {pedido.cliente_nombre}
          </h3>
        </div>
        <div className="text-right select-none">
          <p className="text-[10px] font-black uppercase tracking-tighter opacity-70 text-text-primary dark:text-text-inverse">
            {pedido.metodo_pago || "WHATSAPP"}
          </p>
          <p className="font-black text-xl italic tracking-tighter font-mono text-text-primary dark:text-text-inverse">
            $
            {Number(pedido.total).toLocaleString("es-AR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Listado de Productos Requeridos */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {pedido.pedido_items?.map((item: PedidoItem) => (
            <div
              key={item.id}
              className="flex justify-between text-xs font-bold uppercase italic tracking-tight text-text-primary dark:text-text-inverse"
            >
              <span className="text-text-muted">
                {item.cantidad}x {item.nombre_producto}
              </span>
              <span className="font-black font-mono">
                $
                {(item.precio_unitario * item.cantidad).toLocaleString(
                  "es-AR",
                  { minimumFractionDigits: 2 },
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Detalles de Despacho y Contacto Directo */}
        <div className="pt-4 border-t-2 border-dashed border-border dark:border-border-dark space-y-3 mt-4">
          {/* Enlace Seguro a WhatsApp */}
          <a
            href={`https://wa.me/${pedido.cliente_whatsapp?.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-black text-text-muted dark:text-text-muted/80 uppercase hover:text-primary dark:hover:text-primary transition-colors group"
          >
            <Phone size={12} className="text-primary" />
            <span className="font-mono">{pedido.cliente_whatsapp}</span>
            <ExternalLink
              size={10}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </a>

          {/* Dirección Condicional */}
          {pedido.es_delivery && pedido.direccion_entrega && (
            <div className="flex items-start gap-2 text-[10px] font-black text-text-muted dark:text-text-muted/80 uppercase italic">
              <MapPin size={12} className="text-primary mt-0.5 shrink-0" />
              <span className="leading-tight">{pedido.direccion_entrega}</span>
            </div>
          )}

          {/* Notas del Cliente */}
          {pedido.notas && (
            <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-neo text-[10px] font-bold text-text-muted italic border border-border/50 dark:border-border-dark/50">
              <MessageSquare size={12} className="shrink-0 text-primary" />
              <span>&quot;{pedido.notas}&quot;</span>
            </div>
          )}
        </div>
      </div>

      {/* Botonera de Acciones Tácticas del Operador */}
      <div className="p-4 bg-gray-50 dark:bg-white/5 border-t-2 border-border dark:border-border-dark grid grid-cols-2 gap-2 select-none">
        {/* Estado 1: Pendiente */}
        {pedido.estado === "pendiente" && (
          <button
            type="button"
            onClick={() => handleEstado("preparacion")} // Cambiado a la firma unificada 'preparacion'
            disabled={isPending}
            className="col-span-2 bg-black text-white dark:bg-primary py-4 rounded-neo font-black uppercase italic text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 border-t border-white/10"
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

        {/* Estado 2: Preparando en Cocina (Captura tanto 'preparando' como 'preparacion') */}
        {(pedido.estado === "preparando" ||
          pedido.estado === "preparacion") && (
          <button
            type="button"
            onClick={() =>
              handleEstado(pedido.es_delivery ? "enviado" : "entregado")
            }
            disabled={isPending}
            className="col-span-2 bg-primary text-white py-4 rounded-neo font-black uppercase italic text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 border-t border-white/10"
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

        {/* Estado 3: En viaje */}
        {pedido.estado === "enviado" && (
          <button
            type="button"
            onClick={() => handleEstado("entregado")}
            disabled={isPending}
            className="col-span-2 bg-emerald-600 text-white py-4 rounded-neo font-black uppercase italic text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 border-t border-white/10"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                MARCAR COMO ENTREGADO <Check size={16} strokeWidth={3} />
              </>
            )}
          </button>
        )}

        {/* Botón de Cancelación Rápida Perimetral */}
        {pedido.estado !== "entregado" && pedido.estado !== "cancelado" && (
          <button
            type="button"
            onClick={() => handleEstado("cancelado")}
            disabled={isPending}
            className="col-span-2 mt-1 py-2 text-[10px] font-black uppercase text-error hover:underline transition-all disabled:opacity-30 tokens-none"
          >
            RECHAZAR PEDIDO
          </button>
        )}
      </div>
    </div>
  );
}
