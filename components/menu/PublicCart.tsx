"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { crearPedido } from "@/app/actions/pedidos";
import { ShoppingBag, Clock, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Sub-componentes
import { CartItem } from "./CartItem";
import { OrderForm } from "./OrderForm";

interface PublicCartProps {
  isClosed?: boolean;
  negocioId: string;
}

export function PublicCart({ isClosed, negocioId }: PublicCartProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const [isSending, setIsSending] = useState(false);
  const [customerData, setCustomerData] = useState({
    nombre: "",
    direccion: "",
    whatsapp: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleConfirmarPedido = async () => {
    if (cart.length === 0) return;

    // Validación de campos obligatorios
    if (!customerData.nombre || !customerData.direccion) {
      toast.error("DATOS INCOMPLETOS", {
        description: "Necesitamos tu nombre y dirección para el despacho.",
      });
      return;
    }

    setIsSending(true);

    try {
      // 1. EL CAMBIO CLAVE: Pasamos negocioId como primer argumento independiente
      // 2. El segundo argumento es el objeto con la data del pedido
      const res = await crearPedido(negocioId, {
        nombre: customerData.nombre,
        whatsapp: customerData.whatsapp,
        direccion: customerData.direccion,
        total: totalPrice,
        items: cart, // Enviamos el array de items del CartContext
      });

      if (res.success) {
        toast.success("¡PEDIDO CONFIRMADO! 🚀");
        clearCart();
        setCustomerData({ nombre: "", direccion: "", whatsapp: "" });
      } else {
        toast.error("Error: " + res.error);
      }
    } catch (error) {
      console.error("Error en la acción de pedido:", error);
      toast.error("Error de conexión.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <aside
      id="public-cart-container"
      className={`w-full max-w-[380px] relative transition-all ${isClosed ? "saturate-50" : ""}`}
    >
      {/* Decoración Superior */}
      <div
        className="absolute top-0 left-0 w-full h-2 bg-transparent z-10"
        style={{
          maskImage: "radial-gradient(circle, transparent 4px, black 4px)",
          maskSize: "12px 12px",
          maskPosition: "top",
          backgroundColor: "var(--bg-public)",
        }}
      />

      <div
        className="bg-[#fdfdfd] shadow-2xl p-6 md:p-8 pt-10 min-h-[500px] flex flex-col border-x border-gray-100 text-bg-dark rounded-t-sm"
        style={{ fontFamily: '"Receiptional Receipt", monospace' }}
      >
        {/* Header del Ticket */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="border-2 border-black rounded-full p-2">
              <ShoppingBag size={22} />
            </div>
          </div>
          <h2 className="text-xl font-bold uppercase italic tracking-tighter">
            Resumen de Compra
          </h2>
          <p className="text-[10px] opacity-40 my-1">
            ------------------------------------------
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">
            {new Date().toLocaleDateString("es-AR")} —{" "}
            {new Date().toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Lista de Items (Scrolleable) */}
        <div className="flex-1 space-y-5 mb-6 overflow-y-auto max-h-[300px] pr-1 scrollbar-hide border-b border-dashed border-black/10 pb-6">
          {cart.length === 0 ? (
            <div className="text-center py-16 opacity-30 italic uppercase font-black text-[10px] tracking-widest">
              [ Tu bolsa está vacía ]
            </div>
          ) : (
            cart.map((item) => (
              <CartItem key={item.id} item={item} isClosed={isClosed} />
            ))
          )}
        </div>

        {/* Formulario y Footer */}
        {cart.length > 0 && (
          <div className="animate-in fade-in duration-500">
            <OrderForm data={customerData} onChange={handleInputChange} />

            <div className="flex justify-between items-end mb-6 pt-4 border-t border-black/5">
              <span className="text-xs font-black uppercase italic opacity-60 tracking-widest">
                Total Final
              </span>
              <span className="text-4xl font-black tracking-tighter italic">
                ${totalPrice.toLocaleString("es-AR")}
              </span>
            </div>

            {isClosed ? (
              <div className="bg-error/5 p-4 border border-error/20 flex items-center gap-3 rounded-sm mb-2">
                <Clock className="text-error" size={16} />
                <p className="text-[9px] leading-tight text-error font-black uppercase italic">
                  Servicio inactivo por horario
                </p>
              </div>
            ) : (
              <button
                onClick={handleConfirmarPedido}
                disabled={isSending}
                className="w-full bg-black text-white py-5 font-black text-xs uppercase tracking-[0.3em] hover:invert transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
              >
                {isSending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {isSending ? "CONFIRMANDO..." : "ENVIAR PEDIDO"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Decoración Inferior */}
      <div
        className="w-full h-4 bg-transparent"
        style={{
          backgroundImage:
            "linear-gradient(-45deg, #fdfdfd 8px, transparent 0), linear-gradient(45deg, #fdfdfd 8px, transparent 0)",
          backgroundSize: "16px 16px",
          backgroundPosition: "bottom",
        }}
      />
    </aside>
  );
}
