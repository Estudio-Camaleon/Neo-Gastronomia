"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { updateClientSystemNotes, deleteClientAction } from "./actions";
import { NotesModal } from "@/components/ui/notes-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useDebounce } from "@/core/hooks/useDebounce";
import { TablaEscritorio } from "@/features/admin/clients/components/TablaEscritorio";
import { TarjetasMovil } from "@/features/admin/clients/components/TarjetasMovil";
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
  const [deletingCliente, setDeletingCliente] = useState<ClienteResumen | null>(null);

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

  const handleEditNotes = (cliente: ClienteResumen) => {
    setEditingCliente({ id: cliente.id, notas: cliente.notas });
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

      {/* CONTENEDOR DE LA TABLA / TARJETAS */}
      <div className="admin-card overflow-hidden !p-0">
        <div className="px-5 py-4 border-b border-[var(--admin-border)] flex justify-between items-center">
          <span className="font-bold text-[var(--admin-text)] text-sm">
            Listado de Consumidores
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] px-2.5 py-1 rounded-full">
            {clientesFiltrados.length} Registros
          </span>
        </div>

        {/* TABLA: DESKTOP */}
        <TablaEscritorio
          clientes={clientesFiltrados}
          onEditNotes={handleEditNotes}
          onDeleteClient={(c) => setDeletingCliente(c)}
        />

        {/* TARJETAS: MÓVIL */}
        <TarjetasMovil
          clientes={clientesFiltrados}
          onEditNotes={handleEditNotes}
          onDeleteClient={(c) => setDeletingCliente(c)}
        />

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

      {deletingCliente && (
        <ConfirmModal
          title="Eliminar Cliente"
          message={`¿Estás seguro de eliminar a ${deletingCliente.nombre}? Esta acción no se puede deshacer y se perderá todo su historial.`}
          confirmLabel="Sí, eliminar"
          cancelLabel="No, mantener"
          variant="danger"
          onConfirm={async () => {
            try {
              await deleteClientAction(deletingCliente.id);
              toast.success("Cliente eliminado con éxito");
              setDeletingCliente(null);
            } catch (err) {
              const msg = err instanceof Error ? err.message : "Error de conexión";
              toast.error("Error al eliminar el cliente", { description: msg });
            }
          }}
          onCancel={() => setDeletingCliente(null)}
        />
      )}
    </div>
  );
}
