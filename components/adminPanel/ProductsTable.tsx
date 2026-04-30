"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  disponible: boolean;
}

export function ProductsTable({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);

    const { error } = await supabase
      .from("productos")
      .update({ disponible: !currentStatus })
      .eq("id", id);

    if (error) {
      alert("No se pudo actualizar el estado.");
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, disponible: !currentStatus } : p,
        ),
      );
    }
    setUpdatingId(null);
  };

  return (
    <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-bg-main dark:bg-bg-darker text-text-secondary text-sm border-b border-border dark:border-border-dark">
          <tr>
            <th className="p-4">Producto</th>
            <th className="p-4">Precio</th>
            <th className="p-4">Disponibilidad</th>
            <th className="p-4">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-dark">
          {products.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-text-muted">
                No hay productos registrados.
              </td>
            </tr>
          ) : (
            products.map((prod) => (
              <tr
                key={prod.id}
                className="hover:bg-bg-main dark:bg-bg-darker transition-colors"
              >
                <td className="p-4 font-medium text-text-primary">
                  {prod.nombre}
                </td>
                <td className="p-4 text-text-secondary">${prod.precio}</td>
                <td className="p-4">
                  <button
                    disabled={updatingId === prod.id}
                    onClick={() => toggleAvailability(prod.id, prod.disponible)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      updatingId === prod.id
                        ? "bg-surface-muted text-text-muted"
                        : prod.disponible
                          ? "bg-success-soft text-success"
                          : "bg-error-soft text-error"
                    }`}
                  >
                    {updatingId === prod.id
                      ? "..."
                      : prod.disponible
                        ? "Disponible"
                        : "Agotado"}
                  </button>
                </td>
                <td className="p-4">
                  <button className="text-secondary hover:text-secondary-light font-medium text-sm transition-colors">
                    Editar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
