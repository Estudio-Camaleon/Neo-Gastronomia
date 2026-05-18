"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/core/lib/supabase/client";

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
        console.error("Fallo de lectura en categorías del local:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarCategorias();
  }, [negocioId, supabase]);

  return (
    <div className="flex flex-col gap-1.5 font-sans w-full">
      <label className="text-[11px] uppercase font-black text-black tracking-wider ml-0.5 select-none">
        Categoría
      </label>
      <div className="relative w-full">
        <select
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="w-full bg-white border-2 border-black p-3 pr-10 rounded-none text-xs font-black text-black focus:bg-[#A3FF00]/10 outline-none transition-all disabled:opacity-40 appearance-none uppercase tracking-wide"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%273%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            backgroundSize: "0.9em",
          }}
        >
          <option value="" className="font-mono text-gray-400">
            {loading ? "Sincronizando..." : "SELECCIONAR SECCIÓN"}
          </option>
          {categorias.map((cat) => (
            <option
              key={cat.id}
              value={cat.id}
              className="font-bold text-black bg-white"
            >
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
