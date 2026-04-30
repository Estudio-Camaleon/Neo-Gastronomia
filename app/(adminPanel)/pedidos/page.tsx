import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Tipado estricto para evitar errores de compilación
interface Pedido {
  id: string;
  total: number;
  estado: string;
  created_at: string;
  cliente: {
    nombre: string;
  } | null;
}

export default async function PedidosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Obtener negocio vinculado al usuario logueado
  const { data: negocio, error: negocioError } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (negocioError || !negocio) {
    return (
      <div className="p-8 text-red-500 font-medium">
        No se encontró un negocio vinculado a esta cuenta.
      </div>
    );
  }

  /**
   * 2. Obtener pedidos.
   * Corregimos la consulta: En lugar de cliente_nombre (que no existe),
   * traemos el nombre desde la tabla relacionada 'clientes'.
   */
  const { data: pedidos, error: pedidosError } = await supabase
    .from("pedidos")
    .select(
      `
      id, 
      total, 
      estado, 
      created_at,
      cliente:clientes (nombre)
    `,
    )
    .eq("negocio_id", negocio.id)
    .order("created_at", { ascending: false });

  // Manejo de errores silencioso y limpio para producción
  if (pedidosError) {
    // Solo logueamos en desarrollo para no ensuciar la consola del cliente
    if (process.env.NODE_ENV === "development") {
      console.error("Debug Pedidos:", pedidosError.message);
    }
  }

  const pedidosList = (pedidos as unknown as Pedido[]) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-text-primary dark:text-text-inverse tracking-tighter uppercase italic">
          Pedidos Recibidos
        </h1>
        <p className="text-text-secondary text-sm">
          Panel de control de ventas de Estudio Camaleón.
        </p>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-[2rem] border border-border dark:border-border-dark overflow-hidden shadow-xl shadow-black/5">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-bg-darker text-text-secondary text-[10px] font-black uppercase tracking-widest border-b border-border dark:border-border-dark">
            <tr>
              <th className="p-6">Cliente</th>
              <th className="p-6">Total</th>
              <th className="p-6">Estado</th>
              <th className="p-6 text-right">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-border-dark">
            {pedidosList.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-20 text-center text-text-muted text-sm italic"
                >
                  No hay pedidos registrados en el sistema.
                </td>
              </tr>
            ) : (
              pedidosList.map((pedido) => (
                <tr
                  key={pedido.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="p-6">
                    <p className="text-text-primary dark:text-text-inverse font-bold text-sm uppercase">
                      {pedido.cliente?.nombre || "Cliente Final"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      ID: {pedido.id.split("-")[0]}
                    </p>
                  </td>
                  <td className="p-6">
                    <span className="font-black text-text-primary dark:text-text-inverse">
                      ${Number(pedido.total).toLocaleString("es-AR")}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-surface-muted text-text-secondary border border-black/5">
                      {pedido.estado || "Pendiente"}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <p className="text-text-muted text-xs font-medium">
                      {new Date(pedido.created_at).toLocaleDateString("es-AR")}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(pedido.created_at).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
