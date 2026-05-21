"use client";

import { useState } from "react";
import {
  Search,
  Users,
  User,
  MessageCircle,
  Trophy,
  StickyNote,
  Smartphone,
} from "lucide-react";
import { updateClientSystemNotes } from "../actions";
import { toast } from "sonner";

export interface ClienteResumen {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  totalGasto: number;
  pedidos: number;
  notas: string | null;
}

interface ClientRadarProps {
  initialClientes: ClienteResumen[];
}

export function ClientRadar({ initialClientes }: ClientRadarProps) {
  const [busqueda, setBusqueda] = useState("");

  const clientesFiltrados = initialClientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.telefono && c.telefono.includes(busqueda)),
  );

  const handleAuditarNotas = async (
    id: string,
    notasActuales: string | null,
  ) => {
    // Nota: Mantenemos el prompt por compatibilidad atómica, sanando sus textos
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
    <div className="space-y-6">
      {/* BARRA DE BÚSQUEDA Y CONTROL */}
      <div className="admin-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--admin-surface)] border border-[var(--admin-border)] dark:bg-zinc-900/90 rounded-2xl p-6 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[var(--admin-text)] dark:text-zinc-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-[var(--admin-accent)]" />
            Radar de Clientes
          </h2>
          <p className="text-sm text-[var(--admin-text-muted)] dark:text-zinc-400 font-medium">
            Ranking de fidelidad, volumen de transacciones y notas de auditoría.
          </p>
        </div>

        <div className="relative group w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* CONTENEDOR MONOLÍTICO DE LA TABLA / REJILLA */}
      <div className="admin-card !p-0 overflow-hidden bg-[var(--admin-surface)] border border-[var(--admin-border)] dark:bg-zinc-900/90 rounded-2xl shadow-sm">
        <div className="px-5 py-4 border-b border-[var(--admin-border)]   dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc800/40">
          <span className="font-bold text-gray-700 dark:text-zinc-300 text-sm">
            Listado de Consumidores
          </span>
          <span className="text-xs font-bold bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] dark:bg-[var(--admin-accent)]/20 dark:text-green-400 px-2.5 py-1 rounded-full">
            {clientesFiltrados.length} Registros
          </span>
        </div>

        {/* === TABLA: LAYOUT DESKTOP (md:block) === */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900 text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="p-4 pl-6 font-semibold">Cliente</th>
                <th className="p-4 text-center font-semibold">Inversión</th>
                <th className="p-4 text-center font-semibold">Pedidos</th>
                <th className="p-4 font-semibold">Notas del Sistema</th>
                <th className="p-4 pr-6 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
              {clientesFiltrados.map((cliente, index) => {
                const esTop1 = index === 0;
                return (
                  <tr
                    key={cliente.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors group bg-white dark:bg-zinc-900"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-medium text-gray-400 dark:text-zinc-500 w-4">
                          {index + 1}.
                        </span>
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            esTop1
                              ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border dark:border-amber-900/30"
                              : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {esTop1 ? <Trophy size={16} /> : <User size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-zinc-100 truncate max-w-[200px]">
                            {cliente.nombre}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center font-semibold text-gray-900 dark:text-zinc-100">
                      ${Number(cliente.totalGasto).toFixed(2)}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          cliente.pedidos >= 5
                            ? "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] dark:bg-green-950/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {cliente.pedidos}
                      </span>
                    </td>

                    <td className="p-4 max-w-[250px]">
                      <p className="text-xs text-gray-600 dark:text-zinc-400 truncate font-medium">
                        {cliente.notas ? (
                          cliente.notas
                        ) : (
                          <span className="text-gray-400 dark:text-zinc-600 italic">
                            Sin anotaciones
                          </span>
                        )}
                      </p>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() =>
                            handleAuditarNotas(cliente.id, cliente.notas)
                          }
                          className="p-2 text-gray-500 dark:text-zinc-400 hover:text-[var(--admin-accent)] dark:hover:text-green-400 hover:bg-[var(--admin-accent)]/10 rounded-lg transition-colors border border-transparent"
                          title="Auditar historial"
                        >
                          <StickyNote size={16} />
                        </button>
                        {cliente.telefono && (
                          <a
                            href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors border border-transparent"
                            title="Canal WhatsApp"
                          >
                            <MessageCircle size={16} />
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

        {/* === TARJETAS: LAYOUT RESPONSIVO MÓVIL (md:hidden) === */}
        <div className="grid grid-cols-1 gap-4 md:hidden p-4 bg-gray-50/50 dark:bg-zinc-950/40">
          {clientesFiltrados.map((cliente, index) => {
            const esTop1 = index === 0;
            return (
              <div
                key={cliente.id}
                className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xs flex flex-col space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        esTop1
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border dark:border-amber-900/20"
                          : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {esTop1 ? <Trophy size={18} /> : <User size={18} />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-accent)] dark:text-green-400 block mb-0.5">
                        Rango #{index + 1}
                      </span>
                      <h4 className="font-bold text-gray-900 dark:text-zinc-100 leading-tight">
                        {cliente.nombre}
                      </h4>
                    </div>
                  </div>
                  <span className="font-bold text-lg text-gray-900 dark:text-zinc-100 tracking-tight">
                    ${Number(cliente.totalGasto).toFixed(2)}
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-950 p-3 rounded-lg border border-gray-100 dark:border-zinc-800/60 flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-500 dark:text-zinc-400 text-xs uppercase tracking-wide">
                    Frecuencia de compra
                  </span>
                  <span className="font-bold text-gray-900 dark:text-zinc-200 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded border border-gray-200 dark:border-zinc-800 shadow-xs text-xs">
                    {cliente.pedidos} pedidos
                  </span>
                </div>

                {cliente.notas && (
                  <p className="text-xs text-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30 leading-relaxed font-medium">
                    {cliente.notas}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1 shrink-0">
                  <button
                    onClick={() =>
                      handleAuditarNotas(cliente.id, cliente.notas)
                    }
                    className="py-2.5 px-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex justify-center items-center gap-2 shadow-xs"
                  >
                    <StickyNote size={14} /> Anotaciones
                  </button>
                  {cliente.telefono ? (
                    <a
                      href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-2 shadow-xs"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  ) : (
                    <button
                      disabled
                      className="py-2.5 px-3 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-600 rounded-lg text-xs font-bold cursor-not-allowed flex justify-center items-center"
                    >
                      Sin Teléfono
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SIN RESULTADOS */}
        {clientesFiltrados.length === 0 && (
          <div className="p-12 text-center text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 font-medium">
            No se encontraron clientes activos registrados bajo ese criterio de
            búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
