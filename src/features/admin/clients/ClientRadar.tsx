"use client";

import { useState } from "react";
import {
  Search,
  Users,
  User,
  MessageCircle,
  Trophy,
  StickyNote,
} from "lucide-react";
import { updateClientSystemNotes } from "./actions";
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[var(--admin-text)] flex items-center gap-2">
            <Users className="h-6 w-6 text-[var(--admin-accent)]" />
            Radar de Clientes
          </h2>
          <p className="text-sm text-[var(--admin-text-muted)] font-medium">
            Ranking de fidelidad, volumen de transacciones y notas de auditoría.
          </p>
        </div>

        <div className="relative group w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg py-2.5 pl-10 pr-4 text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all shadow-sm placeholder:text-[var(--admin-text-muted)]"
          />
        </div>
      </div>

      {/* CONTENEDOR MONOLÍTICO DE LA TABLA / REJILLA */}
      <div className="overflow-hidden bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl shadow-sm">
        <div className="px-5 py-4 border-b border-[var(--admin-border)] flex justify-between items-center bg-[var(--admin-bg)]/50">
          <span className="font-bold text-[var(--admin-text)] text-sm">
            Listado de Consumidores
          </span>
          <span className="text-xs font-bold bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] px-2.5 py-1 rounded-full">
            {clientesFiltrados.length} Registros
          </span>
        </div>

        {/* === TABLA: LAYOUT DESKTOP (md:block) === */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/30 text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                <th className="p-4 pl-6 font-semibold">Cliente</th>
                <th className="p-4 text-center font-semibold">Inversión</th>
                <th className="p-4 text-center font-semibold">Pedidos</th>
                <th className="p-4 font-semibold">Notas del Sistema</th>
                <th className="p-4 pr-6 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)] text-sm">
              {clientesFiltrados.map((cliente, index) => {
                const esTop1 = index === 0;
                return (
                  <tr
                    key={cliente.id}
                    className="hover:bg-[var(--admin-bg)] transition-colors group bg-[var(--admin-surface)]"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-medium text-[var(--admin-text-muted)] w-4">
                          {index + 1}.
                        </span>
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            esTop1
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] border border-[var(--admin-border)]"
                          }`}
                        >
                          {esTop1 ? <Trophy size={16} /> : <User size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--admin-text)] truncate max-w-[200px]">
                            {cliente.nombre}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center font-semibold text-[var(--admin-text)]">
                      ${Number(cliente.totalGasto).toFixed(2)}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          cliente.pedidos >= 5
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-[var(--admin-bg)] text-[var(--admin-text)] border border-[var(--admin-border)]"
                        }`}
                      >
                        {cliente.pedidos}
                      </span>
                    </td>

                    <td className="p-4 max-w-[250px]">
                      <p className="text-xs text-[var(--admin-text-muted)] truncate font-medium">
                        {cliente.notas ? (
                          cliente.notas
                        ) : (
                          <span className="opacity-50 italic">
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
                          className="p-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 rounded-lg transition-colors border border-transparent"
                          title="Auditar historial"
                        >
                          <StickyNote size={16} />
                        </button>
                        {cliente.telefono && (
                          <a
                            href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors border border-transparent"
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
        <div className="grid grid-cols-1 gap-4 md:hidden p-4 bg-[var(--admin-bg)]">
          {clientesFiltrados.map((cliente, index) => {
            const esTop1 = index === 0;
            return (
              <div
                key={cliente.id}
                className="p-4 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-sm flex flex-col space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        esTop1
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] border border-[var(--admin-border)]"
                      }`}
                    >
                      {esTop1 ? <Trophy size={18} /> : <User size={18} />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-accent)] block mb-0.5">
                        Rango #{index + 1}
                      </span>
                      <h4 className="font-bold text-[var(--admin-text)] leading-tight">
                        {cliente.nombre}
                      </h4>
                    </div>
                  </div>
                  <span className="font-bold text-lg text-[var(--admin-text)] tracking-tight">
                    ${Number(cliente.totalGasto).toFixed(2)}
                  </span>
                </div>

                <div className="bg-[var(--admin-bg)] p-3 rounded-lg border border-[var(--admin-border)] flex justify-between items-center text-sm">
                  <span className="font-semibold text-[var(--admin-text-muted)] text-xs uppercase tracking-wide">
                    Frecuencia de compra
                  </span>
                  <span className="font-bold text-[var(--admin-text)] bg-[var(--admin-surface)] px-2.5 py-1 rounded border border-[var(--admin-border)] shadow-sm text-xs">
                    {cliente.pedidos} pedidos
                  </span>
                </div>

                {cliente.notas && (
                  <p className="text-xs text-amber-600 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 leading-relaxed font-medium">
                    {cliente.notas}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1 shrink-0">
                  <button
                    onClick={() =>
                      handleAuditarNotas(cliente.id, cliente.notas)
                    }
                    className="py-2.5 px-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] rounded-lg text-xs font-bold hover:border-[var(--admin-accent)] transition-colors flex justify-center items-center gap-2 shadow-sm"
                  >
                    <StickyNote size={14} /> Anotaciones
                  </button>
                  {cliente.telefono ? (
                    <a
                      href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-[#25D366] hover:opacity-90 text-white rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-2 shadow-sm"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  ) : (
                    <button
                      disabled
                      className="py-2.5 px-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)] rounded-lg text-xs font-bold cursor-not-allowed flex justify-center items-center"
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
          <div className="p-12 text-center text-[var(--admin-text-muted)] bg-[var(--admin-surface)] font-medium">
            No se encontraron clientes activos registrados bajo ese criterio de
            búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
