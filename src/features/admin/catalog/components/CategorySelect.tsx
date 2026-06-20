"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/core/lib/supabase/client";
// removed Loader2 (replaced with FoodMini)
import { FoodMini } from "@/components/ui/food-loading";
import { toast } from "sonner";

const supabase = createClient();

interface Categoria {
  id: string;
  nombre: string;
}

interface CategorySelectProps {
  negocioId?: string;
  selectedId?: string;
  hideLabel?: boolean;
  onChange: (id: string) => void;
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;
}

export function CategorySelect({
  negocioId,
  selectedId,
  hideLabel = false,
  onChange,
  onBlur,
}: CategorySelectProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

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
        toast.error("Error al cargar las categorías");
        console.error("Fallo de lectura en categorías del local:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarCategorias();
  }, [negocioId]);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {!hideLabel && (
        <label className="text-sm font-semibold text-[var(--admin-text)]">
          Categoría
        </label>
      )}
      <div className="relative w-full">
        <select
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={loading}
          className="w-full bg-[var(--admin-bg)] border border-[var(--admin-border)] p-2.5 pr-10 rounded-lg text-sm text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23a1a1aa%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            backgroundSize: "1rem",
          }}
        >
          <option
            value=""
            className="text-[var(--admin-text-muted)] bg-[var(--admin-bg)]"
          >
            {loading ? "Cargando secciones..." : "Seleccionar sección..."}
          </option>
          {!loading && categorias.length === 0 ? (
            <option
              value=""
              disabled
              className="text-[var(--admin-text-muted)] bg-[var(--admin-bg)]"
            >
              Sin categorías disponibles
            </option>
          ) : (
            categorias.map((cat) => (
              <option
                key={cat.id}
                value={cat.id}
                className="text-[var(--admin-text)] bg-[var(--admin-surface)]"
              >
                {cat.nombre}
              </option>
            ))
          )}
        </select>

        {loading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]">
            <FoodMini size={14} />
          </div>
        )}
      </div>
    </div>
  );
}
