"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Beaker, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TestOrderButton({ negocioId }: { negocioId: string }) {
  const [isPending, setIsPending] = useState(false);
  const supabase = createClient();

  const createTestOrder = async () => {
    setIsPending(true);

    try {
      // 1. Crear el Pedido (Padre)
      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([
          {
            negocio_id: negocioId,
            cliente_nombre: "Facundo (Test Neo)",
            cliente_whatsapp: "381000000",
            total: 4500.5,
            metodo_pago: "Efectivo",
            es_delivery: true,
            direccion_entrega: "Av. Siempre Viva 123, Tucumán",
            notas: "Esto es un pedido de prueba para testear Realtime.",
            estado: "pendiente",
          },
        ])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // 2. Crear los Items del Pedido (Hijos)
      const { error: itemsError } = await supabase.from("pedido_items").insert([
        {
          pedido_id: pedido.id,
          nombre_producto: "Hamburguesa Neo Double",
          precio_unitario: 3500,
          cantidad: 1,
        },
        {
          pedido_id: pedido.id,
          nombre_producto: "Papas Fritas Medianas",
          precio_unitario: 1000.5,
          cantidad: 1,
        },
      ]);

      if (itemsError) throw itemsError;

      toast.success("ORDEN DE PRUEBA GENERADA", {
        description: "Debería aparecer en el Radar ahora mismo.",
      });
    } catch (error: any) {
      console.error(error);
      toast.error("Error al generar test", { description: error.message });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={createTestOrder}
      disabled={isPending}
      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-neo font-black uppercase italic text-[10px] tracking-widest hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="animate-spin" size={14} />
      ) : (
        <Beaker size={14} />
      )}
      Simular Pedido
    </button>
  );
}
