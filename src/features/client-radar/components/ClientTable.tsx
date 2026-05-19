"use client";

import { User, MessageCircle, Trophy, StickyNote } from "lucide-react";
import { ClienteResumen } from "./ClientRadar";
import { updateClientSystemNotes } from "../actions";
import { toast } from "sonner";

export function ClientTable({ clientes }: { clientes: ClienteResumen[] }) {
  const handleAuditarNotas = async (
    id: string,
    notasActuales: string | null,
  ) => {
    const promptNueva = window.prompt(
      "EDITAR NOTAS TÉCNICAS DEL CLIENTE:",
      notasActuales || "",
    );
    if (promptNueva === null) return;

    try {
      await updateClientSystemNotes(id, promptNueva);
      toast.success("EXPEDIENTE DE CLIENTE ACTUALIZADO");
    } catch {
      toast.error("FALLO DE RED");
    }
  };

  return (
    <div className="w-full font-sans text-black">
      {/* VISTA DESKTOP (TABLE ESTRUCTURADA) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-4 border-black bg-gray-50 text-xs font-black uppercase tracking-wider text-black">
              <th className="p-4">Rango / Comprador</th>
              <th className="p-4 text-center">Inversión Bruta</th>
              <th className="p-4 text-center">Frecuencia</th>
              <th className="p-4 text-center">Notas de Control</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 text-sm">
            {clientes.map((cliente, index) => {
              const esTop1 = index === 0;
              return (
                <tr
                  key={cliente.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-black text-gray-400 w-5">
                        {index + 1}.
                      </span>
                      <div
                        className={`w-10 h-10 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] shrink-0 ${esTop1 ? "bg-[#A3FF00]" : "bg-black text-white"}`}
                      >
                        {esTop1 ? (
                          <Trophy size={16} className="text-black" />
                        ) : (
                          <User size={16} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black uppercase italic tracking-tight text-black">
                          {cliente.nombre}
                        </span>
                        {cliente.email && (
                          <span className="text-[10px] text-gray-400 font-mono">
                            {cliente.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-center font-mono font-black text-base text-black">
                    ${Number(cliente.totalGasto).toFixed(2)}
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className={`inline-block border border-black text-[10px] font-black px-2 py-0.5 uppercase tracking-wide ${cliente.pedidos >= 5 ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"}`}
                    >
                      {cliente.pedidos}{" "}
                      {cliente.pedidos === 1 ? "Pedido" : "Pedidos"}
                    </span>
                  </td>

                  <td className="p-4 text-center max-w-[200px]">
                    <p className="text-xs font-medium text-gray-500 truncate italic">
                      {cliente.notas ? `"${cliente.notas}"` : "Sin anotaciones"}
                    </p>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() =>
                          handleAuditarNotas(cliente.id, cliente.notas)
                        }
                        className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-black hover:bg-black hover:text-white"
                        title="Editar expediente"
                      >
                        <StickyNote size={14} />
                      </button>
                      {cliente.telefono && (
                        <a
                          href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 border-2 border-black bg-[#25D366] text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                          title="Abrir chat"
                        >
                          <MessageCircle size={14} strokeWidth={2.5} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* VISTA MÓVIL (TARJETAS COMPACTAS PLANAS) */}
      <div className="grid grid-cols-1 gap-4 md:hidden p-4 bg-gray-50">
        {clientes.map((cliente, index) => (
          <div
            key={cliente.id}
            className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 border border-black flex items-center justify-center ${index === 0 ? "bg-[#A3FF00]" : "bg-black text-white"}`}
                >
                  {index === 0 ? <Trophy size={14} /> : <User size={14} />}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black text-gray-400 block">
                    RANGO #{index + 1}
                  </span>
                  <h4 className="font-black uppercase italic tracking-tight text-sm text-black">
                    {cliente.nombre}
                  </h4>
                </div>
              </div>
              <span className="font-mono font-black text-xs bg-black text-white px-2 py-0.5">
                ${Number(cliente.totalGasto).toFixed(0)}
              </span>
            </div>

            <div className="bg-gray-50 p-2 border border-black/5 flex justify-between items-center text-xs">
              <span className="font-bold text-gray-500 uppercase text-[10px]">
                Frecuencia:
              </span>
              <span className="font-black italic">{cliente.pedidos} Peds</span>
            </div>

            {cliente.notas && (
              <p className="text-[11px] font-medium text-gray-500 bg-amber-50/50 p-2 border border-dashed border-black/10 italic">
                "{cliente.notas}"
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleAuditarNotas(cliente.id, cliente.notas)}
                className="p-2 border-2 border-black bg-white text-xs font-black uppercase text-center active:translate-y-0.5"
              >
                Expediente
              </button>
              {cliente.telefono ? (
                <a
                  href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border-2 border-black bg-[#25D366] text-black text-xs font-black uppercase text-center active:translate-y-0.5"
                >
                  WhatsApp
                </a>
              ) : (
                <button
                  disabled
                  className="p-2 border border-gray-300 text-gray-400 text-xs font-black uppercase text-center cursor-not-allowed opacity-40"
                >
                  Sin Tel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
