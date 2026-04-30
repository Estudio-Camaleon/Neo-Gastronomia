import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Definimos el tipo de dato para que TypeScript no marque errores
interface Pedido {
  id: string;
  cliente_nombre: string;
  total: number;
  estado: string;
  created_at: string;
}

export default async function PedidosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Obtener negocio
  const { data: negocio, error: negocioError } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (negocioError || !negocio) {
    return (
      <div className="p-8 text-text-primary dark:text-text-inverse">
        No se pudo cargar el negocio.
      </div>
    );
  }

  // 2. Obtener pedidos del negocio con tipado explícito
  const { data: pedidos, error: pedidosError } = await supabase
    .from("pedidos")
    .select("id, cliente_nombre, total, estado, created_at")
    .eq("negocio_id", negocio.id)
    .order("created_at", { ascending: false })
    .returns<Pedido[]>();

  if (pedidosError) {
    console.error("Error al cargar pedidos:", pedidosError);
  }

  const pedidosList = pedidos || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-inverse">
          Pedidos Recibidos
        </h1>
        <p className="text-text-secondary">Gestiona el estado de tus ventas.</p>
      </div>

      <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-bg-main dark:bg-bg-darker text-text-secondary text-sm border-b border-border dark:border-border-dark">
            <tr>
              <th className="p-4">Cliente</th>
              <th className="p-4">Total</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {pedidosList.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-muted">
                  Aún no tienes pedidos registrados.
                </td>
              </tr>
            ) : (
              pedidosList.map((pedido) => (
                <tr
                  key={pedido.id}
                  className="hover:bg-bg-main dark:bg-bg-darker transition-colors"
                >
                  <td className="p-4 text-text-primary dark:text-text-inverse font-medium">
                    {pedido.cliente_nombre}
                  </td>
                  <td className="p-4 text-text-secondary">
                    ${Number(pedido.total).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface-muted text-text-secondary border border-border dark:border-border-dark">
                      {pedido.estado || "Pendiente"}
                    </span>
                  </td>
                  <td className="p-4 text-text-muted text-sm">
                    {new Date(pedido.created_at).toLocaleDateString()}
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
