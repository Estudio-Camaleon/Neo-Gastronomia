"use client";

import { useState } from "react";
import { useCartStore } from "../store/useCartStore";
import { createClient } from "@/lib/supabase/client";
import { ShoppingBag, X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OrderForm } from "./OrderForm";
import { CartItem } from "./CartItem"; // Importación requerida para pintar las líneas interactivas

interface PublicCartProps {
  negocioId: string;
  isDrawer?: boolean;     
  onCloseDrawer?: () => void; 
}

export function PublicCart({ negocioId, isDrawer = false, onCloseDrawer }: PublicCartProps) {
  const [loading, setLoading] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [form, setForm] = useState({
    nombre: "",
    whatsapp: "",
    delivery: false,
    direccion: "",
  });

  const supabase = createClient();
  const total = cart.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const enviarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const { data: pedido, error: pErr } = await supabase
        .from("pedidos")
        .insert([
          {
            negocio_id: negocioId,
            cliente_nombre: form.nombre.toUpperCase().trim(),
            cliente_whatsapp: form.whatsapp.trim(),
            total,
            es_delivery: form.delivery,
            direccion_entrega: form.delivery
              ? form.direccion.toUpperCase().trim()
              : "RETIRO EN LOCAL",
            estado: "pendiente",
          },
        ])
        .select()
        .single();

      if (pErr) throw pErr;

      const { error: iErr } = await supabase.from("pedido_items").insert(
        cart.map((i) => ({
          pedido_id: pedido.id,
          producto_id: i.id,
          nombre_producto: i.nombre,
          precio_unitario: i.precio,
          cantidad: i.cantidad,
        }))
      );

      if (iErr) throw iErr;

      toast.success("¡PEDIDO ENVIADO A LA COCINA! 🍔");
      clearCart();
      if (onCloseDrawer) onCloseDrawer();
    } catch (error) {
      console.error("Error al procesar orden:", error);
      toast.error("Error al despachar el pedido");
    } finally {
      setLoading(false);
    }
  };

  // Si el carrito está vacío en la columna fija de Escritorio, muestra un UNICO placeholder limpio
  if (cart.length === 0 && !isDrawer) {
    return (
      <div className="py-16 text-center space-y-3 font-sans animate-in fade-in duration-300 select-none">
        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto text-text-muted opacity-40">
          <ShoppingBag size={20} />
        </div>
        <p className="text-[10px] font-black uppercase text-text-muted italic tracking-wider">
          El carrito está vacío
        </p>
      </div>
    );
  }

  // Si es drawer móvil y está vacío, no renderiza nada en pantalla
  if (cart.length === 0 && isDrawer) return null;

  return (
    <div className="flex flex-col h-full font-sans">
      
      {/* Cabecera condicional solo para Modal Móvil */}
      {isDrawer && (
        <div className="flex justify-between items-center mb-6 border-b-2 pb-4 border-border dark:border-border-dark">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-text-primary dark:text-text-inverse">
            Tu Carrito
          </h2>
          <button
            type="button"
            onClick={onCloseDrawer}
            className="text-text-primary dark:text-text-inverse p-1 hover:opacity-70 transition-opacity"
          >
            <X size={28} />
          </button>
        </div>
      )}

      {/* Listado de Productos usando CartItem de Zustand */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin max-h-[280px] lg:max-h-none divide-y-2 divide-dashed divide-border/30 dark:divide-border-dark/30">
        {cart.map((item, index) => (
          <div key={item.id} className={index > 0 ? "pt-3" : ""}>
            <CartItem item={item} />
          </div>
        ))}
      </div>

      {/* Caja de Totales */}
      <div className="pt-4 mt-4 border-t-2 border-border dark:border-border-dark flex justify-between items-end">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Total Estimado</span>
        <span className="text-2xl font-black font-mono italic text-text-primary dark:text-text-inverse tracking-tighter">
          ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Formulario y Botón de Despacho */}
      <form onSubmit={enviarPedido} className="mt-4 pt-4 border-t border-dashed border-border/60 dark:border-border-dark/60">
        <OrderForm data={form} onChange={handleFormChange} />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white dark:bg-primary dark:text-white py-4 rounded-neo font-black italic uppercase text-[11px] tracking-[0.2em] flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md border-t border-white/10 mt-4"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <Send size={14} /> PEDIR POR WHATSAPP
            </>
          )}
        </button>
      </form>
    </div>
  );
}