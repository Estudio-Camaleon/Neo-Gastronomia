"use client";

import { useCartStore } from "../store/useCartStore";
import { Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ProductoMenuData {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
}

interface MenuCardProps {
  producto: ProductoMenuData;
}

export function MenuCard({ producto }: MenuCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAdd = () => {
    addToCart({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
    });
    toast.success(`${producto.nombre} agregado 🛒`);
  };

  return (
    // MODIFICADO: Usamos dark:hover:border-custom/40 para que el borde destelle con la paleta del negocio
    <div className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super overflow-hidden flex p-2.5 gap-4 shadow-sm hover:shadow-md dark:hover:border-custom/40 transition-all animate-in fade-in duration-300 font-sans w-full">
      {/* Contenedor de Imagen con Relación de Aspecto Controlada */}
      <div className="relative w-24 h-24 bg-gray-50 dark:bg-black/20 shrink-0 rounded-xl overflow-hidden flex items-center justify-center border border-border/40 dark:border-border-dark/40">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            sizes="96px"
            className="object-cover"
            priority={false}
          />
        ) : (
          <ShoppingBag className="opacity-10 w-8 h-8 text-text-primary dark:text-text-inverse" />
        )}
      </div>

      {/* Información Comercial del Producto */}
      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        <div className="space-y-0.5">
          <h3 className="font-black uppercase italic text-sm text-text-primary dark:text-text-inverse tracking-tight truncate">
            {producto.nombre}
          </h3>
          <p className="text-[10px] text-text-muted dark:text-text-muted/80 font-medium line-clamp-2 leading-tight">
            {producto.descripcion || "Sin descripción disponible"}
          </p>
        </div>

        {/* Acciones de Compra y Precio de Venta */}
        <div className="flex justify-between items-center pt-2">
          <span className="font-black italic text-base text-text-primary dark:text-text-inverse font-mono tracking-tight">
            $
            {Number(producto.precio).toLocaleString("es-AR", {
              minimumFractionDigits: 2,
            })}
          </span>

          {/* MODIFICADO: Usamos bg-custom para que en el modo light o dark el botón principal adopte la identidad comercial */}
          <button
            type="button"
            onClick={handleAdd}
            className="bg-black text-white dark:bg-custom dark:text-white p-2.5 rounded-neo hover:opacity-90 transition-opacity active:scale-90 border-t border-white/10 flex items-center justify-center shadow-md shadow-black/5"
            title="Agregar al carrito"
          >
            <Plus size={15} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
