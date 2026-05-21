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
      "Editar notas técnicas del cliente:",
      notasActuales || "",
    );
    if (promptNueva === null) return;

    try {
      await updateClientSystemNotes(id, promptNueva);
      toast.success("Notas de cliente actualizadas");
    } catch {
      toast.error("Error al actualizar notas");
    }
  };

  return (
    <div className="w-full">
      {/* VISTA DESKTOP */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-white text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4 pl-6 font-medium">Cliente</th>
              <th className="p-4 text-center font-medium">Inversión</th>
              <th className="p-4 text-center font-medium">Pedidos</th>
              <th className="p-4 font-medium">Notas</th>
              <th className="p-4 pr-6 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {clientes.map((cliente, index) => {
              const esTop1 = index === 0;
              return (
                <tr
                  key={cliente.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-400 w-4">
                        {index + 1}.
                      </span>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${esTop1 ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"}`}
                      >
                        {esTop1 ? (
                          <Trophy size={16} />
                        ) : (
                          <User size={16} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                          {cliente.nombre}
                        </span>
                        {cliente.email && (
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">
                            {cliente.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <span className="font-medium text-gray-900">
                      ${Number(cliente.totalGasto).toFixed(2)}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${cliente.pedidos >= 5 ? "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]" : "bg-gray-100 text-gray-700"}`}
                    >
                      {cliente.pedidos}
                    </span>
                  </td>

                  <td className="p-4 max-w-[250px]">
                    <p className="text-xs text-gray-600 truncate">
                      {cliente.notas ? cliente.notas : <span className="text-gray-400 italic">Sin notas</span>}
                    </p>
                  </td>

                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          handleAuditarNotas(cliente.id, cliente.notas)
                        }
                        className="p-2 text-gray-400 hover:text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 rounded-lg transition-colors border border-transparent hover:border-[var(--admin-accent)]/20"
                        title="Editar notas"
                      >
                        <StickyNote size={16} />
                      </button>
                      {cliente.telefono && (
                        <a
                          href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200"
                          title="Abrir chat en WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {clientes.length === 0 && (
               <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                     No se encontraron clientes que coincidan con la búsqueda.
                  </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VISTA MÓVIL */}
      <div className="grid grid-cols-1 gap-4 md:hidden p-4 bg-gray-50/50">
        {clientes.map((cliente, index) => {
           const esTop1 = index === 0;
           
           return (
          <div
            key={cliente.id}
            className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${esTop1 ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"}`}
                >
                  {esTop1 ? <Trophy size={18} /> : <User size={18} />}
                </div>
                <div>
                  <span className="text-xs font-semibold text-[var(--admin-accent)] block mb-0.5">
                    Rango #{index + 1}
                  </span>
                  <h4 className="font-bold text-gray-900 leading-tight">
                    {cliente.nombre}
                  </h4>
                </div>
              </div>
              <span className="font-bold text-lg text-gray-900">
                ${Number(cliente.totalGasto).toFixed(0)}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center text-sm">
              <span className="font-medium text-gray-500">
                Frecuencia
              </span>
              <span className="font-semibold text-gray-900 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{cliente.pedidos} pedidos</span>
            </div>

            {cliente.notas && (
              <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-100 leading-relaxed">
                {cliente.notas}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleAuditarNotas(cliente.id, cliente.notas)}
                className="py-2.5 px-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex justify-center items-center gap-2 shadow-sm"
              >
                <StickyNote size={16} /> Notas
              </button>
              {cliente.telefono ? (
                <a
                  href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#25D366] text-white rounded-lg text-sm font-semibold hover:bg-[#25D366]/90 transition-colors flex justify-center items-center gap-2 shadow-sm"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
              ) : (
                <button
                  disabled
                  className="py-2.5 px-3 bg-gray-100 border border-gray-200 text-gray-400 rounded-lg text-sm font-semibold cursor-not-allowed flex justify-center items-center"
                >
                  Sin Teléfono
                </button>
              )}
            </div>
          </div>
        )})}
        
        {clientes.length === 0 && (
           <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
              No hay clientes para mostrar.
           </div>
        )}
      </div>
    </div>
  );
}
