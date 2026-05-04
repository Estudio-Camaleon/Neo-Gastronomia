import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, TrendingUp, ShoppingBag } from "lucide-react";

interface ClienteResumen {
  nombre: string;
  totalGasto: number;
  pedidos: number;
}

export default async function ClientesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Obtener ID del negocio vinculado al usuario
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!negocio) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-black uppercase italic text-primary">
          Negocio no configurado
        </h2>
      </div>
    );
  }

  // 2. Obtener pedidos (Solo traemos campos necesarios para ahorrar ancho de banda)
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("cliente_nombre, total")
    .eq("negocio_id", negocio.id);

  // 3. Agrupar y calcular totales (Lógica optimizada)
  const resumenClientes = (pedidos || []).reduce(
    (acc: Record<string, ClienteResumen>, pedido) => {
      const nombre = pedido.cliente_nombre?.trim() || "Consumidor Final";

      if (!acc[nombre]) {
        acc[nombre] = { nombre, totalGasto: 0, pedidos: 0 };
      }

      acc[nombre].totalGasto += Number(pedido.total || 0);
      acc[nombre].pedidos += 1;
      return acc;
    },
    {},
  );

  const listaClientes: ClienteResumen[] = Object.values(resumenClientes).sort(
    (a, b) => b.totalGasto - a.totalGasto, // Ordenamos por mayor gasto primero
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen pb-20">
      {/* Header con estética NEO */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic">
          Tu Comunidad
        </h1>
        <p className="text-text-muted text-sm font-bold uppercase tracking-widest mt-1">
          Análisis de fidelidad y comportamiento de compra
        </p>
      </div>

      {/* Tabla con diseño de alta calidad */}
      <div className="bg-white dark:bg-bg-darker rounded-super border-2 border-border dark:border-border-dark overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-white/5 text-text-muted text-[10px] uppercase font-black tracking-widest border-b-2 border-border dark:border-border-dark">
              <tr>
                <th className="p-5 flex items-center gap-2">
                  <Users size={14} className="text-primary" /> Cliente
                </th>
                <th className="p-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-primary" /> Inversión
                    Total
                  </div>
                </th>
                <th className="p-5">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={14} className="text-primary" />{" "}
                    Frecuencia
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-border dark:divide-border-dark">
              {listaClientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-16 text-center text-text-muted font-bold italic uppercase text-xs"
                  >
                    Aún no hay interacciones registradas.
                  </td>
                </tr>
              ) : (
                listaClientes.map((cliente) => (
                  <tr
                    key={cliente.nombre}
                    className="group hover:bg-primary/5 transition-all duration-200"
                  >
                    <td className="p-5 font-black text-text-primary uppercase tracking-tight italic">
                      {cliente.nombre}
                    </td>
                    <td className="p-5 font-mono font-bold text-text-secondary text-lg">
                      $
                      {cliente.totalGasto.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-5">
                      <span className="bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-text-primary">
                        {cliente.pedidos}{" "}
                        {cliente.pedidos === 1 ? "Pedido" : "Pedidos"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
