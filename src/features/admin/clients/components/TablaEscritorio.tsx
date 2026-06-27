"use client";

import { FaWhatsapp } from "react-icons/fa";
import { User, Trophy, StickyNote, Calendar, Trash2 } from "lucide-react";
import type { ClienteResumen } from "@/core/types/domain";
import { formatPesos, esClienteVirtual } from "@/features/admin/clients/client-utils";
import { toast } from "sonner";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function daysSince(iso: string | null): string | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return null;
}

interface TablaEscritorioProps {
  clientes: ClienteResumen[];
  onEditNotes: (cliente: ClienteResumen) => void;
  onDeleteClient: (cliente: ClienteResumen) => void;
}

export function TablaEscritorio({ clientes, onEditNotes, onDeleteClient }: TablaEscritorioProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/30 text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
            <th scope="col" className="p-4 pl-6 font-semibold">Cliente</th>
            <th scope="col" className="p-4 text-center font-semibold">Inversión</th>
            <th scope="col" className="p-4 text-center font-semibold">Pedidos</th>
            <th scope="col" className="p-4 text-center font-semibold">Último Pedido</th>
            <th scope="col" className="p-4 font-semibold">Notas del Sistema</th>
            <th scope="col" className="p-4 pr-6 text-right font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--admin-border)] text-sm">
          {clientes.map((cliente, index) => {
            const esTop1 = index === 0;
            const rel = cliente.ultimoPedido ? daysSince(cliente.ultimoPedido) : null;
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

                <td className="p-4 text-center font-semibold text-[var(--admin-text)] font-mono tabular-nums">
                  {formatPesos(cliente.totalGasto)}
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

                <td className="p-4 text-center">
                  {cliente.ultimoPedido ? (
                    <div className="inline-flex items-center gap-1.5">
                      <Calendar size={12} className="text-[var(--admin-text-muted)]" />
                      <span className="text-xs text-[var(--admin-text-muted)] font-medium">
                        {formatDate(cliente.ultimoPedido)}
                      </span>
                      {rel && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-[1px] rounded-full ${
                            rel === "Hoy" || rel === "Ayer"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)]"
                          }`}
                        >
                          {rel}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--admin-text-muted)] opacity-50 italic">
                      Sin pedidos
                    </span>
                  )}
                </td>

                <td className="p-4 max-w-[200px]">
                  <p className="text-xs text-[var(--admin-text-muted)] truncate font-medium">
                    {cliente.notas ? (
                      cliente.notas
                    ) : (
                      <span className="opacity-50 italic">Sin anotaciones</span>
                    )}
                  </p>
                </td>

                <td className="p-4 pr-6 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => {
                        if (esClienteVirtual(cliente.id)) {
                          toast.info("Registra al cliente desde un pedido para gestionar sus notas.");
                          return;
                        }
                        onEditNotes(cliente);
                      }}
                      className="p-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 rounded-xl transition-all duration-200 border border-transparent hover:border-[var(--admin-accent)]/20 active:scale-90"
                      title="Auditar historial"
                      aria-label={`Editar notas de ${cliente.nombre}`}
                    >
                      <StickyNote size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteClient(cliente)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-red-500/20 active:scale-90"
                      title="Eliminar cliente"
                      aria-label={`Eliminar ${cliente.nombre}`}
                    >
                      <Trash2 size={16} />
                    </button>
                    {cliente.telefono && (
                      <a
                        href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-500 hover:bg-green-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-green-500/20 active:scale-90"
                        title="Canal WhatsApp"
                        aria-label={`Enviar WhatsApp a ${cliente.nombre}`}
                      >
                        <FaWhatsapp size={16} />
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
  );
}
