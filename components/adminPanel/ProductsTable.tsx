"use client";

import { useState, useOptimistic, useTransition } from "react";
import { updateProductAvailability } from "@/app/actions/productos"; // Debemos crear esta Server Action
import { toast } from "sonner";
import { Loader2, Edit3, CircleDot } from "lucide-react";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  disponible: boolean;
  categoria?: string;
}

export function ProductsTable({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [isPending, startTransition] = useTransition();

  // Optimizamos la UI: El cambio se ve instantáneo antes de ir a la DB
  const [optimisticProducts, addOptimisticUpdate] = useOptimistic(
    initialProducts,
    (state, { id, disponible }: { id: string; disponible: boolean }) =>
      state.map((p) => (p.id === id ? { ...p, disponible } : p)),
  );

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // 1. Actualización optimista inmediata en la UI
    startTransition(async () => {
      addOptimisticUpdate({ id, disponible: newStatus });

      try {
        // 2. Llamada a la Server Action (Protege contra restricciones de conexión)
        const result = await updateProductAvailability(id, newStatus);

        if (!result.success) {
          toast.error("Error al sincronizar con la base de datos");
        }
      } catch (error) {
        toast.error("Fallo de conexión. Reintentando...");
      }
    });
  };

  return (
    <div className="w-full overflow-hidden rounded-super border-2 border-border dark:border-border-dark bg-white dark:bg-bg-darker shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-white/5 text-text-muted text-[10px] uppercase font-black tracking-widest border-b-2 border-border dark:border-border-dark">
            <tr>
              <th className="p-5">Producto</th>
              <th className="p-5">Precio</th>
              <th className="p-5 text-center">Estado</th>
              <th className="p-5 text-right">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border dark:divide-border-dark">
            {optimisticProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-12 text-center text-text-muted font-bold italic uppercase text-xs"
                >
                  No hay productos en el radar.
                </td>
              </tr>
            ) : (
              optimisticProducts.map((prod) => (
                <tr
                  key={prod.id}
                  className="group hover:bg-primary/5 transition-all duration-200"
                >
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="font-black text-text-primary uppercase tracking-tight italic">
                        {prod.nombre}
                      </span>
                      <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">
                        {prod.categoria || "Menú General"}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 font-mono font-bold text-text-secondary">
                    ${prod.precio.toLocaleString()}
                  </td>
                  <td className="p-5 text-center">
                    <button
                      disabled={isPending}
                      onClick={() =>
                        toggleAvailability(prod.id, prod.disponible)
                      }
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 ${
                        prod.disponible
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                      }`}
                    >
                      <CircleDot
                        size={12}
                        className={isPending ? "animate-pulse" : ""}
                      />
                      {prod.disponible ? "Disponible" : "Agotado"}
                    </button>
                  </td>
                  <td className="p-5 text-right">
                    <button className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
