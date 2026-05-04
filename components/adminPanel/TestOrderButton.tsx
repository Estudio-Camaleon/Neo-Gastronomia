"use client";

import { useState } from "react";
import { crearPedido } from "@/app/actions/pedidos";
import { toast } from "sonner";
import { FlaskConical, Loader2 } from "lucide-react";

export function TestOrderButton() {
  const [isPending, setIsPending] = useState(false);

  const ejecutarPrueba = async () => {
    setIsPending(true);

    // IMPORTANTE: Ajustamos a la firma de la Server Action: (negocioId, datosPedido)
    const negocioId = "c4c01e74-5cc3-4a26-8254-0a77757bcfc3"; // ID de tu tabla negocios

    const datosPedido = {
      nombre: "Tester MacDonals",
      whatsapp: "54381000000",
      direccion: "Av. Alem 123",
      total: 5000,
      metodoPago: "Efectivo",
      notas: "Prueba técnica de NEO",
      items: [
        {
          id: "9a0f8937-b5fc-4c95-85d5-c23fe6b5c901",
          nombre: "Hamburguesa Test",
          precio: 2500,
          cantidad: 2,
        },
      ],
    };

    try {
      const res = await crearPedido(negocioId, datosPedido);

      if (res.success) {
        toast.success("¡PEDIDO IMPACTADO! 🚀", {
          description: "El Radar NEO debería detectarlo en breve.",
        });
        // No hace falta reload(), el RealtimeOrders se encarga de refrescar la data.
      } else {
        toast.error(`Fallo en DB: ${res.error}`);
      }
    } catch (error) {
      toast.error("Error de red al intentar simular el pedido.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[9999]">
      <button
        disabled={isPending}
        onClick={ejecutarPrueba}
        className="group relative flex items-center gap-3 bg-emerald-500 text-white px-8 py-5 rounded-full shadow-[0_20px_50px_rgba(16,185,129,0.3)] font-black uppercase tracking-widest border-4 border-white hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      >
        {/* Efecto de brillo NEO */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

        {isPending ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <FlaskConical className="animate-bounce" size={20} />
        )}

        <span className="text-sm italic">Simular Pedido</span>
      </button>
    </div>
  );
}
