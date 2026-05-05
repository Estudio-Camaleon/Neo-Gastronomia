"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Categoria {
  id: string;
  nombre: string;
}

interface CategorySelectProps {
  negocioId?: string;
  selectedId?: string;
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
        console.error("Error al cargar categorías en el panel:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarCategorias();
  }, [negocioId, supabase]); // Agregado 'supabase' para blindar contra advertencias de dependencias

  return (
    <div className="flex flex-col gap-1.5 font-sans">
      <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1 select-none">
        Categoría
      </label>
      <div className="relative w-full">
        <select
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="w-full bg-surface dark:bg-bg-darker border-2 border-border dark:border-border-dark p-3 pr-10 rounded-xl text-sm font-bold text-text-primary dark:text-text-inverse focus:border-primary outline-none transition-all disabled:opacity-50 appearance-none uppercase"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1em",
          }}
        >
          <option value="" className="normal-case">
            {loading ? "Cargando..." : "Seleccionar categoría"}
          </option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
