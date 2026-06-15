"use client";

import { useState, useRef } from "react";
import { Users, User, MessageCircle, Trophy, StickyNote } from "lucide-react";
import { updateClientSystemNotes } from "./actions";
import { NotesModal } from "@/components/ui/notes-modal";
import { toast } from "sonner";
import { useDebounce } from "@/core/hooks/useDebounce";
import type { ClienteResumen } from "@/core/types/domain";

interface ClientRadarProps {
  initialClientes: ClienteResumen[];
}

export function ClientRadar({ initialClientes }: ClientRadarProps) {
  const [busqueda, setBusqueda] = useState("");
  const searchQuery = useDebounce(busqueda);
  const [editingCliente, setEditingCliente] = useState<{
    id: string;
    notas: string | null;
  } | null>(null);

  const clientesFiltrados = initialClientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.telefono && c.telefono.includes(searchQuery)),
  );

  const noHayClientes = initialClientes.length === 0;

  const handleSaveNotes = async (value: string) => {
    if (!editingCliente) return;
    await updateClientSystemNotes(editingCliente.id, value);
    toast.success("Notas de cliente actualizadas");
  };

  return (
    <div className="space-y-6">
      {/* BARRA DE BÚSQUEDA Y CONTROL */}
      <div className="admin-card p-5 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--admin-text)] flex items-center gap-2">
              <Users className="h-6 w-6 text-[var(--admin-accent)]" />
              Radar de Clientes
            </h2>
            <p className="text-sm font-medium text-[var(--admin-text-muted)]">
              Ranking de fidelidad, volumen de transacciones y notas de
              auditoría.
            </p>
          </div>

          <div className="relative group w-full md:max-w-md">
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="admin-input"
            />
          </div>
        </div>
      </div>

      {/* CONTENEDOR MONOLÍTICO DE LA TABLA / REJILLA */}
      <div className="admin-card overflow-hidden !p-0">
        <div className="px-5 py-4 border-b border-[var(--admin-border)] flex justify-between items-center">
          <span className="font-bold text-[var(--admin-text)] text-sm">
            Listado de Consumidores
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] px-2.5 py-1 rounded-full">
            {clientesFiltrados.length} Registros
          </span>
        </div>

        {/* === TABLA: LAYOUT DESKTOP (md:block) === */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/30 text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                <th scope="col" className="p-4 pl-6 font-semibold">
                  Cliente
                </th>
                <th scope="col" className="p-4 text-center font-semibold">
                  Inversión
                </th>
                <th scope="col" className="p-4 text-center font-semibold">
                  Pedidos
                </th>
                <th scope="col" className="p-4 font-semibold">
                  Notas del Sistema
                </th>
                <th scope="col" className="p-4 pr-6 text-right font-semibold">
                  Acciones
                </th>
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
                    onClick={() => {
                      if (cliente.id.startsWith("virtual_")) {
                        toast.info("Registra al cliente desde un pedido para gestionar sus notas.");
                        return;
                      }
                      setEditingCliente({
                        id: cliente.id,
                        notas: cliente.notas,
                      })
                    }}
                    className="p-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 rounded-xl transition-all duration-200 border border-transparent hover:border-[var(--admin-accent)]/20 active:scale-90"
                    title="Auditar historial"
                  >
                    <StickyNote size={16} />
                  </button>
                        {cliente.telefono && (
                          <a
                            href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-500 hover:bg-green-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-green-500/20 active:scale-90"
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
        <div className="grid grid-cols-1 gap-4 md:hidden p-4">
          {clientesFiltrados.map((cliente, index) => {
            const esTop1 = index === 0;
            return (
              <div
                key={cliente.id}
                className="admin-card p-4 rounded-xl flex flex-col space-y-4"
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
                    onClick={() => {
                      if (cliente.id.startsWith("virtual_")) {
                        toast.info("Registra al cliente desde un pedido para gestionar sus notas.");
                        return;
                      }
                      setEditingCliente({
                        id: cliente.id,
                        notas: cliente.notas,
                      })
                    }}
                    className="btn-secondary flex-1 text-[11px]"
                  >
                    <StickyNote size={14} /> Anotaciones
                  </button>
                  {cliente.telefono ? (
                    <a
                      href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366] hover:opacity-90 text-white rounded-xl text-[11px] font-bold transition-all active:scale-95 shadow-sm"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-2.5 px-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)] rounded-xl text-xs font-bold cursor-not-allowed flex justify-center items-center"
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
            {noHayClientes
              ? "Aún no hay clientes registrados. Los primeros comensales aparecerán aquí automáticamente."
              : "No hay clientes que coincidan con ese criterio de búsqueda."}
          </div>
        )}
      </div>

      {editingCliente && (
        <NotesModal
          title="Editar Notas del Cliente"
          initialValue={editingCliente.notas ?? ""}
          onSave={handleSaveNotes}
          onClose={() => setEditingCliente(null)}
        />
      )}
    </div>
  );
}
