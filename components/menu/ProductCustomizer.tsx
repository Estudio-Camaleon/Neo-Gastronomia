"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "./store/useCartStore";
import { toast } from "sonner";

interface Variant {
  nombre: string;
  precio: number;
}

interface ExtraItem {
  id: string;
  nombre: string;
  precio: number;
}

interface ExtraGroup {
  id: string;
  titulo: string;
  requerido: boolean;
  multiple: boolean;
  items: ExtraItem[];
}

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  variantes?: Variant[];
  grupo_extras?: ExtraGroup[];
}

interface ProductCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductCustomizer({
  isOpen,
  onClose,
  product,
}: ProductCustomizerProps) {
  const { addItem } = useCartStore();

  const [cantidad, setCantidad] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<
    Record<string, string[]>
  >({});
  const [notas, setNotas] = useState("");

  // --- SOLUCIÓN DE RENDIMIENTO: Render-Phase State Update ---
  // Guardamos el estado anterior para saber si el modal pasó de cerrado a abierto
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && product) {
      // El modal se acaba de abrir: Reseteamos los campos instantáneamente
      setCantidad(1);
      setNotas("");
      setSelectedExtras({});
      if (product.variantes && product.variantes.length > 0) {
        setSelectedVariant(product.variantes[0]);
      } else {
        setSelectedVariant(null);
      }
    }
  }
  // ----------------------------------------------------------

  if (!isOpen || !product) return null;

  // Calculamos el precio total al vuelo
  const calcularPrecioTotal = () => {
    const base = selectedVariant ? selectedVariant.precio : product.precio_base;
    let extrasTotal = 0;

    if (product.grupo_extras) {
      product.grupo_extras.forEach((grupo) => {
        const seleccionados = selectedExtras[grupo.id] || [];
        seleccionados.forEach((extraId) => {
          const extraItem = grupo.items.find((i) => i.id === extraId);
          if (extraItem) extrasTotal += extraItem.precio;
        });
      });
    }

    return (base + extrasTotal) * cantidad;
  };

  const precioTotal = calcularPrecioTotal();

  const handleExtraToggle = (
    grupoId: string,
    itemId: string,
    isMultiple: boolean,
  ) => {
    setSelectedExtras((prev) => {
      const currentSelections = prev[grupoId] || [];
      if (!isMultiple) {
        return { ...prev, [grupoId]: [itemId] };
      }
      if (currentSelections.includes(itemId)) {
        return {
          ...prev,
          [grupoId]: currentSelections.filter((id) => id !== itemId),
        };
      } else {
        return { ...prev, [grupoId]: [...currentSelections, itemId] };
      }
    });
  };

  const handleAddToCart = () => {
    const detallesSeleccion: string[] = [];

    if (selectedVariant)
      detallesSeleccion.push(`Tamaño: ${selectedVariant.nombre}`);

    Object.entries(selectedExtras).forEach(([grupoId, itemsIds]) => {
      const grupo = product.grupo_extras?.find((g) => g.id === grupoId);
      if (grupo) {
        itemsIds.forEach((itemId) => {
          const item = grupo.items.find((i) => i.id === itemId);
          if (item) detallesSeleccion.push(`+ ${item.nombre}`);
        });
      }
    });

    if (notas) detallesSeleccion.push(`Notas: ${notas}`);

    const cartItem = {
      id: `${product.id}-${Date.now()}`,
      nombre: product.nombre,
      precio: precioTotal / cantidad,
      cantidad: cantidad,
      detalles: detallesSeleccion.join(" | "),
    };

    addItem(cartItem);
    toast.success("AGREGADO AL CARRITO", {
      description: `Se sumó ${cantidad}x ${product.nombre.toUpperCase()} a tu pedido.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white border-2 border-black p-1 hover:bg-gray-200 transition-colors"
        >
          <X size={24} />
        </button>

        {product.imagen_url && (
          <div className="h-48 w-full border-b-4 border-black bg-gray-100 relative">
            <Image
              src={product.imagen_url}
              alt={product.nombre}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              {product.nombre}
            </h2>
            <p className="text-gray-600 font-medium mt-1">
              {product.descripcion}
            </p>
          </div>

          {product.variantes && product.variantes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold uppercase border-b-2 border-black pb-1">
                Seleccioná una opción
              </h3>
              <div className="grid gap-3">
                {product.variantes.map((variante, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center justify-between p-3 border-2 border-black cursor-pointer transition-colors ${selectedVariant?.nombre === variante.nombre ? "bg-custom text-black" : "bg-white hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="variante"
                        className="w-5 h-5 accent-black"
                        checked={selectedVariant?.nombre === variante.nombre}
                        onChange={() => setSelectedVariant(variante)}
                      />
                      <span className="font-bold">{variante.nombre}</span>
                    </div>
                    <span className="font-bold">${variante.precio}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {product.grupo_extras?.map((grupo) => (
            <div key={grupo.id} className="space-y-3">
              <div className="flex items-baseline justify-between border-b-2 border-black pb-1">
                <h3 className="font-bold uppercase">{grupo.titulo}</h3>
                {grupo.requerido && (
                  <span className="text-xs font-bold bg-black text-white px-2 py-0.5">
                    Obligatorio
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                {grupo.items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type={grupo.multiple ? "checkbox" : "radio"}
                        name={grupo.id}
                        className="w-5 h-5 accent-black"
                        checked={(selectedExtras[grupo.id] || []).includes(
                          item.id,
                        )}
                        onChange={() =>
                          handleExtraToggle(grupo.id, item.id, grupo.multiple)
                        }
                      />
                      <span className="font-medium">{item.nombre}</span>
                    </div>
                    {item.precio > 0 && (
                      <span className="font-bold text-gray-600">
                        +${item.precio}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <h3 className="font-bold uppercase border-b-2 border-black pb-1">
              Aclaraciones
            </h3>
            <textarea
              placeholder="Ej: Sin aderezos, la hamburguesa bien cocida..."
              className="w-full border-2 border-black p-3 resize-none focus:outline-none focus:ring-2 focus:ring-black"
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t-4 border-black p-4 bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center border-2 border-black bg-white">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="p-3 hover:bg-gray-200 transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="w-12 text-center font-black text-lg">
                {cantidad}
              </span>
              <button
                onClick={() => setCantidad(cantidad + 1)}
                className="p-3 hover:bg-gray-200 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-500 uppercase">Total</p>
              <p className="text-2xl font-black">
                ${precioTotal.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-custom border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all py-4 font-black uppercase text-lg flex items-center justify-center gap-2"
          >
            <ShoppingBag size={24} />
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}
