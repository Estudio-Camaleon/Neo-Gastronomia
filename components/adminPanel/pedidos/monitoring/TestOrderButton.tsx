"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Beaker, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface TestOrderButtonProps {
  negocioId: string;
}

const NOMBRES_TEST = [
  "Elon Musk",
  "Sarah Connor",
  "John Wick",
  "Ada Lovelace",
  "Tony Stark",
  "Neo",
  "Trinity",
];
const PRODUCTOS_TEST = [
  {
    nombre: "Hamburguesa Neo Double",
    precio: 4500,
    detalles: "Término medio | + Extra Queso",
  },
  {
    nombre: "Pizza Cyberpunk XL",
    precio: 8200,
    detalles: "Sin aceitunas | Borde de queso",
  },
  {
    nombre: "Tacos de la Matrix (x3)",
    precio: 3800,
    detalles: "Salsa picante nivel 5",
  },
  { nombre: "Ramen Binario", precio: 5500, detalles: "Huevo marinado extra" },
  { nombre: "Cerveza de Nitrógeno", precio: 2200, detalles: "Bien fría" },
  {
    nombre: "Papas Fritas Glitch",
    precio: 1500,
    detalles: "Con cheddar fundido",
  },
];

export function TestOrderButton({ negocioId }: TestOrderButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const supabase = createClient();

  const createTestOrder = async () => {
    setIsPending(true);

    try {
      // 1. GENERACIÓN DE DATOS
      const cliente =
        NOMBRES_TEST[Math.floor(Math.random() * NOMBRES_TEST.length)];
      const esDelivery = Math.random() > 0.5;
      const cantProductos = Math.floor(Math.random() * 2) + 2;
      const seleccionados = [...PRODUCTOS_TEST]
        .sort(() => 0.5 - Math.random())
        .slice(0, cantProductos);
      const totalCalculado = seleccionados.reduce(
        (acc, p) => acc + p.precio,
        0,
      );

      // 2. INSERCIÓN DEL PEDIDO
      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          negocio_id: negocioId,
          cliente_nombre: `${cliente} (Test)`,
          cliente_whatsapp:
            "381" + Math.floor(Math.random() * 9000000 + 1000000),
          total: totalCalculado,
          metodo_pago: Math.random() > 0.5 ? "Efectivo" : "Transferencia",
          es_delivery: esDelivery,
          direccion_entrega: esDelivery ? "Calle Falsa 123, Sector 7-G" : null,
          notas: "Simulación de estrés del sistema Realtime.",
          estado: "pendiente",
        })
        .select()
        .single();

      if (pedidoError) throw pedidoError;
      if (!pedido) throw new Error("No se pudo crear el pedido base.");

      // 3. INSERCIÓN DE LOS ÍTEMS
      const itemsParaInsertar = seleccionados.map((p) => ({
        pedido_id: pedido.id,
        nombre_producto: p.nombre,
        precio_unitario: p.precio,
        cantidad: 1,
        detalles: p.detalles,
      }));

      const { error: itemsError } = await supabase
        .from("pedido_items")
        .insert(itemsParaInsertar);

      if (itemsError) throw itemsError;

      toast.success(`ORDEN DE ${cliente.toUpperCase()} GENERADA`, {
        description: `Total: $${totalCalculado} | ${esDelivery ? "DELIVERY" : "RETIRO"}`,
        icon: <Sparkles className="text-yellow-500" />,
      });
    } catch (error: unknown) {
      // Le damos una estructura para que TS no proteste por el .message
      const err = error as {
        message: string;
        details?: string;
        hint?: string;
        code?: string;
      };

      console.error("--- FALLA EN LA MATRIX ---");
      console.error("Mensaje:", err.message);
      console.error("Detalles:", err.details);
      console.error("Sugerencia:", err.hint);
      console.error("Código:", err.code);

      const errorMessage = err.message || "Error desconocido en Supabase";

      toast.error("Simulación fallida", {
        description: `Causa: ${errorMessage}. Revisá la consola para más info.`,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={createTestOrder}
      disabled={isPending}
      className="group relative flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-neo border-2 border-black shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95 disabled:opacity-50 select-none font-sans overflow-hidden"
    >
      <div className="absolute inset-0 bg-purple-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      <div className="relative z-10 flex items-center gap-2 font-black uppercase italic text-[10px] tracking-[0.2em]">
        {isPending ? (
          <Loader2 className="animate-spin" size={14} />
        ) : (
          <Beaker size={14} />
        )}
        Simular Orden Real
      </div>
    </button>
  );
}
