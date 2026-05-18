"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Edit3,
  Trash2,
  Tag,
  Package,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/core/lib/supabase/client";
import Image from "next/image";
import { IngredientBadge } from "./IngredientBadge";
import { deleteProductAction } from "../actions";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface ProductoInventario {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  disponible: boolean;
  configuracion: { grupos_opciones?: Array<Record<string, unknown>> } | null;
  categorias: { nombre: string } | null;
}

interface ProductTableProps {
  negocioId: string;
  onEdit: (producto: ProductoInventario) => void;
}

export function ProductTable({ negocioId, onEdit }: ProductTableProps) {
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const cargarProductos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("productos")
        .select(
          `id, nombre, descripcion, precio, imagen_url, disponible, configuracion, categorias(nombre)`,
        )
        .eq("negocio_id", negocioId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProductos((data as any) || []);
    } catch (error) {
      console.error("Error Sync Catálogo:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, negocioId]);

  useEffect(() => {
    cargarProductos();

    const canal: RealtimeChannel = supabase
      .channel(`realtime-catalog-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "productos",
          filter: `negocio_id=eq.${negocioId}`,
        },
        () => {
          cargarProductos();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [cargarProductos, supabase, negocioId]);

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar irreversiblemente "${nombre.toUpperCase()}"?`))
      return;

    try {
      await deleteProductAction(id);
      toast.success("PRODUCTO REMOVIDO DEL ALMACÉN");
    } catch (err: any) {
      toast.error("FALLO DE ELIMINACIÓN", { description: err.message });
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-2 font-mono text-xs text-gray-500">
        <Loader2 className="animate-spin text-black shrink-0" size={24} />
        <span>Sincronizando registros con Supabase...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse font-sans">
        <thead>
          <tr className="border-b-4 border-black bg-gray-50 text-xs font-black uppercase tracking-wider text-black">
            <th className="p-4">Detalle del Producto</th>
            <th className="p-4 hidden md:table-cell">Sección</th>
            <th className="p-4">Precio</th>
            <th className="p-4">Estado</th>
            <th className="p-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-black/10 text-sm">
          {productos.map((prod) => (
            <tr
              key={prod.id}
              className="hover:bg-gray-50/80 transition-colors group"
            >
              <td className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gray-100 overflow-hidden">
                    {prod.imagen_url ? (
                      <Image
                        src={prod.imagen_url}
                        alt={prod.nombre}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={18} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-black uppercase italic tracking-tight leading-none text-black">
                      {prod.nombre}
                    </p>
                    <IngredientBadge configuracion={prod.configuracion} />
                    <p className="text-[11px] text-gray-400 font-medium line-clamp-1 max-w-[240px]">
                      {prod.descripcion || "Sin especificaciones técnicas"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-4 hidden md:table-cell">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-tight bg-gray-100 px-2 py-1 border border-black rounded-md">
                  <Tag size={10} /> {prod.categorias?.nombre || "General"}
                </span>
              </td>
              <td className="p-4 font-mono font-black italic">
                ${Number(prod.precio).toFixed(2)}
              </td>
              <td className="p-4">
                {prod.disponible ? (
                  <span className="bg-emerald-100 border border-emerald-500 text-emerald-800 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide">
                    Activo
                  </span>
                ) : (
                  <span className="bg-gray-100 border border-gray-400 text-gray-600 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide opacity-60">
                    Pausado
                  </span>
                )}
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(prod)}
                    className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-black hover:bg-black hover:text-white"
                  >
                    <Edit3 size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => handleEliminar(prod.id, prod.nombre)}
                    className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
