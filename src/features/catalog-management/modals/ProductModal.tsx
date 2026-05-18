"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/core/lib/supabase/client";
import { X, Loader2 } from "lucide-react";
import { ProductoForm } from "../forms/ProductoForm";

// 1. Tipamos las Categorías
interface Categoria {
  id: string;
  nombre: string;
}

// 2. Tipamos el Producto
interface ProductoData {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string | number;
  imagen_url: string | null;
  categoria_id: string | null;
  disponible: boolean;
  configuracion?: {
    variantes?: Array<{ nombre: string; precio: number | string }>;
    grupo_extras?: Array<{
      id: string;
      titulo: string;
      requerido: boolean;
      multiple: boolean;
      items: Array<{ id: string; nombre: string; precio: number | string }>;
    }>;
  } | null;
}

interface ProductModalProps {
  negocioId: string;
  onClose: () => void;
  productoAEditar?: ProductoData | null;
}

export function ProductModal({
  negocioId,
  onClose,
  productoAEditar = null,
}: ProductModalProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Buscamos las categorías y manejamos el scroll del body
  useEffect(() => {
    const fetchCategorias = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("categorias")
        .select("id, nombre")
        .eq("negocio_id", negocioId);

      if (data) setCategorias(data);
      setLoadingCats(false);
    };
    fetchCategorias();

    // UX Pro: Bloqueamos el scroll del fondo mientras el modal está abierto
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [negocioId]);

  return (
    // Backdrop: En mobile se alinea abajo (items-end), en PC al centro (items-center)
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/70 sm:p-4 transition-all">
      {/* Contenedor Principal (Responsive):
        - Mobile: Ocupa el 100% del ancho, sube desde abajo (bottom sheet).
        - Desktop: max-w-5xl (más ancho para las 3 columnas), centrado.
      */}
      <div className="relative w-full max-w-5xl max-h-[95vh] md:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-full md:slide-in-from-bottom-8 md:zoom-in-95 duration-300">
        {/* Botón de cierre fijo:
          Se queda siempre visible aunque scrollees el formulario.
          En desktop sale un poco hacia afuera, en mobile queda adentro.
        */}
        <button
          onClick={onClose}
          className="absolute z-50 top-4 right-4 md:-top-5 md:-right-5 p-2 md:p-3 bg-error text-white rounded-full border-2 md:border-4 border-black hover:scale-110 hover:rotate-90 active:scale-95 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
          aria-label="Cerrar"
        >
          <X size={24} strokeWidth={3} />
        </button>

        {/* Área Scrolleable del Formulario:
          Solo esta parte scrollea, manteniendo el botón X en su lugar.
        */}
        <div className="w-full h-full overflow-y-auto bg-transparent rounded-t-[32px] md:rounded-[32px] pb-10 md:pb-0">
          {loadingCats ? (
            <div className="bg-white dark:bg-bg-darker p-20 w-full rounded-t-[32px] md:rounded-[32px] flex flex-col justify-center items-center h-[50vh] md:h-64 border-t-4 md:border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <Loader2 className="animate-spin text-primary mb-4" size={48} />
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">
                Cargando sistema...
              </p>
            </div>
          ) : (
            <ProductoForm
              negocioId={negocioId}
              categorias={categorias}
              initialData={productoAEditar}
              onSuccess={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
