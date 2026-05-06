import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  PedidosRadar,
  type PedidoData,
} from "@/components/adminPanel/pedidos/PedidosRadar";

/**
 * Panel de Control de Pedidos NEO.
 * Orquesta la hidratación inicial de datos estáticos desde el servidor libres de lógica de estados.
 */
export default async function PedidosPage() {
  const supabase = await createClient();

  // 1. Control perimetral de sesión activa en el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Obtención del contexto de inquilino (Negocio asociado al usuario)
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre")
    .eq("user_id", user.id)
    .single();

  if (!negocio) redirect("/configuracion");

  // 3. Hidratación inicial del lote de pedidos mediante un JOIN relacional tipado
  const { data: pedidosIniciales } = await supabase
    .from("pedidos")
    .select(
      `
      id,
      estado,
      cliente_nombre,
      metodo_pago,
      total,
      cliente_whatsapp,
      es_delivery,
      direccion_entrega,
      notas,
      pedido_items (
        id,
        cantidad,
        nombre_producto,
        precio_unitario
      )
    `,
    )
    .eq("negocio_id", negocio.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Parseo seguro acoplado al contrato de interfaces de Estudio Camaleón sin 'any'
  const listaPedidos = (pedidosIniciales || []) as unknown as PedidoData[];

  return (
    <div className="p-6 md:p-10 space-y-10 min-h-screen pb-32 max-w-7xl mx-auto font-sans relative">
      {/* El Radar ahora orquesta de forma interna el header reactivo, estadísticas en vivo y mutaciones */}
      <PedidosRadar
        initialPedidos={listaPedidos}
        negocioId={negocio.id}
        negocioNombre={negocio.nombre}
      />

      {/* Marca de Agua Estética de Respaldo NEO */}
      <div className="fixed bottom-10 right-10 pointer-events-none opacity-5 select-none z-0">
        <h2 className="text-[12rem] font-black italic leading-none tracking-tighter text-border dark:text-border-dark">
          NEO
        </h2>
      </div>
    </div>
  );
}
