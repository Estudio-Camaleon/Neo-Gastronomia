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
      console.error("Error al actualizar:", error);
      alert("No se pudo actualizar el estado. Intenta de nuevo.");
    } else {
      // Solo actualizamos el estado local si la base de datos respondió correctamente
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, disponible: !currentStatus } : p,
        ),
      );
    }

    setUpdatingId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-500 text-sm">
          <tr>
            <th className="p-4">Producto</th>
            <th className="p-4">Precio</th>
            <th className="p-4">Disponibilidad</th>
            <th className="p-4">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-gray-400">
                No hay productos registrados.
              </td>
            </tr>
          ) : (
            products.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{prod.nombre}</td>
                <td className="p-4 text-gray-600">${prod.precio}</td>
                <td className="p-4">
                  <button
                    disabled={updatingId === prod.id}
                    onClick={() => toggleAvailability(prod.id, prod.disponible)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      updatingId === prod.id
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : prod.disponible
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-green-200"
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
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
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
