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
import { PedidoData } from "./PedidosRadar";

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

  return (
    <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between font-sans text-black animate-in fade-in duration-150">
      {/* HEADER DE CANAL DE DESPACHO */}
      <div
        className={`p-4 border-b-4 border-black flex justify-between items-center ${pedido.estado === "en_preparacion" ? "bg-[#A3FF00]/10" : "bg-gray-50"}`}
      >
        <div className="flex items-center gap-2">
          {pedido.es_delivery ? (
            <Truck size={14} className="stroke-[2.5]" />
          ) : (
            <Smartphone size={14} className="stroke-[2.5]" />
          )}
          <span className="font-black uppercase italic text-xs tracking-tighter line-clamp-1 max-w-[180px]">
            {pedido.es_delivery
              ? `Envío: ${pedido.direccion_entrega}`
              : "Retiro Presencial"}
          </span>
        </div>
        <span className="font-mono font-black text-[10px] text-gray-400 uppercase">
          [#{pedido.id.slice(0, 6)}]
        </span>
      </div>

      {/* CUERPO DE DATOS */}
      <div className="p-4 space-y-4 flex-1">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h4 className="font-black text-xl uppercase leading-none tracking-tight">
              {pedido.cliente_nombre}
            </h4>
            <p className="text-[10px] font-mono font-black uppercase text-gray-400 mt-1">
              Pago: {pedido.metodo_pago} •{" "}
              <span className="underline text-black font-black font-sans text-xs">
                ${Number(pedido.total).toFixed(2)}
              </span>
            </p>
          </div>
          <a
            href={`https://wa.me/${pedido.cliente_whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border-2 border-black bg-[#25D366] text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <MessageCircle size={14} strokeWidth={3} />
          </a>
        </div>

        {/* COMANDA INTERNA */}
        <div className="bg-gray-50 border-2 border-black p-3 space-y-2">
          <span className="text-[9px] font-mono font-black uppercase tracking-widest text-gray-400 block">
            [!] COMANDA DE COCINA
          </span>
          <div className="space-y-1.5 divide-y divide-black/5 text-xs">
            {pedido.pedido_items?.map((item) => (
              <div key={item.id} className="pt-1.5 first:pt-0 flex flex-col">
                <p className="font-black uppercase">
                  <span className="bg-black text-[#A3FF00] px-1 py-0.5 text-[10px] font-mono mr-1.5">
                    {item.cantidad}X
                  </span>
                  {item.nombre_producto}
                </p>
                {item.detalles && (
                  <span className="text-[10px] font-medium text-gray-500 italic pl-6 mt-0.5">
                    ↳ {item.detalles}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {pedido.notas && (
          <div className="bg-amber-50 border-2 border-dashed border-black p-3 text-xs">
            <span className="font-mono font-black uppercase text-amber-700 block text-[9px]">
              Aclaraciones de Ticket:
            </span>
            <p className="font-medium italic mt-0.5">"{pedido.notas}"</p>
          </div>
        )}
      </div>

      {/* CONTROLADORES DE ESTADO INDUSTRIALES */}
      <div className="p-3 border-t-4 border-black bg-gray-50 grid grid-cols-2 gap-2">
        {pedido.estado === "pendiente" ? (
          <>
            <button
              onClick={() => onUpdateStatus(pedido.id, "cancelado")}
              disabled={isLoading}
              className="p-2.5 bg-white border-2 border-black font-black uppercase text-[10px] tracking-wider text-red-600 shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 flex items-center justify-center gap-1"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={12} />
              ) : (
                <XCircle size={12} />
              )}{" "}
              Rechazar
            </button>
            <button
              onClick={() => onUpdateStatus(pedido.id, "en_preparacion")}
              disabled={isLoading}
              className="p-2.5 bg-[#A3FF00] border-2 border-black font-black uppercase text-[10px] tracking-wider text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 flex items-center justify-center gap-1"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={12} />
              ) : (
                <Check size={12} strokeWidth={3} />
              )}{" "}
              Cocinar
            </button>
          </>
        ) : (
          <button
            onClick={() => onUpdateStatus(pedido.id, "entregado")}
            disabled={isLoading}
            className="col-span-2 p-3 bg-black text-[#A3FF00] border-2 border-black font-black uppercase text-[10px] tracking-widest shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 flex items-center justify-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={12} />
            ) : (
              <CheckCircle2 size={12} />
            )}{" "}
            Finalizar y Entregar Comanda
          </button>
        )}
      </div>
    </div>
  );
}
