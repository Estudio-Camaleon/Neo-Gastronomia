"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/core/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface Categoria {
  id: string;
  nombre: string;
}

interface CategorySelectProps {
  negocioId?: string;
  selectedId?: string;
  // CORREGIDO: Eliminamos la propiedad duplicada/huérfana 'category_id'
  onChange: (id: string) => void;
}

export function CategorySelect({
  negocioId,
  selectedId,
  onChange,
}: CategorySelectProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function cargarCategorias() {
      try {
        let consulta = supabase
          .from("categorias")
          .select("id, nombre")
          .order("nombre", { ascending: true });

        if (negocioId) {
          consulta = consulta.eq("negocio_id", negocioId);
        }

        const { data, error } = await consulta;
        if (error) throw error;
        setCategorias(data || []);
      } catch (err) {
        console.error("Fallo de lectura en categorías del local:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarCategorias();
  }, [negocioId, supabase]);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
        Categoría
      </label>
      <div className="relative w-full">
        <select
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 p-2.5 pr-10 rounded-md text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all appearance-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23a1a1aa%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            backgroundSize: "1rem",
          }}
        >
          <option value="" className="text-gray-500 dark:bg-zinc-900">
            {loading ? "Cargando secciones..." : "Seleccionar sección..."}
          </option>
          {/* CORREGIDO: Cambiamos la variable del ciclo de 'category_id' a 'cat' */}
          {categorias.map((cat) => (
            <option
              key={cat.id}
              value={cat.id}
              className="text-gray-900 dark:text-zinc-100 dark:bg-zinc-900"
            >
              {cat.nombre}
            </option>
          ))}
        </select>

        {loading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500">
            <Loader2 size={14} className="animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
