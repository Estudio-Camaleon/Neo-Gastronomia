"use client";

import { crearPedido } from "@/app/actions/pedidos";
import { toast } from "sonner";

export function TestOrderButton() {
  const ejecutarPrueba = async () => {
    const res = await crearPedido(
      {
        // CAMBIADO: Usando el ID que encontraste en tu tabla negocios
        negocioId: "c4c01e74-5cc3-4a26-8254-0a77757bcfc3",
        nombre: "Tester MacDonals",
        whatsapp: "54381000000",
        direccion: "Av. Alem 123",
        total: 5000,
        metodoPago: "Efectivo",
        notas: "Prueba técnica de NEO",
      },
      [
        {
          // Usando el ID de producto que me pasaste
          id: "9a0f8937-b5fc-4c95-85d5-c23fe6b5c901",
          nombre: "Hamburguesa Test",
          precio: 2500,
          cantidad: 2,
        },
      ],
    );

    if (res.success) {
      toast.success("¡PEDIDO IMPACTADO!", {
        description: "Refrescando el panel...",
      });
      setTimeout(() => window.location.reload(), 1500);
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[9999]">
      <button
        onClick={ejecutarPrueba}
        className="bg-[#10b981] text-white p-6 rounded-full shadow-2xl font-black animate-bounce border-4 border-white hover:scale-110 transition-transform active:scale-95"
      >
        PROBAR DB 🚀
      </button>
    </div>
  );
}
