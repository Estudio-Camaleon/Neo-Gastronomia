import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Definimos la estructura del resumen del cliente
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

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!negocio)
    return (
      <div className="p-8 text-text-primary dark:text-text-inverse">
        Negocio no encontrado.
      </div>
    );

  // Obtenemos los pedidos
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("cliente_nombre, total")
    .eq("negocio_id", negocio.id);

  // Agrupamos y calculamos totales usando tipado
  const resumenClientes = (pedidos || []).reduce(
    (acc: Record<string, ClienteResumen>, pedido) => {
      const nombre = pedido.cliente_nombre || "Anónimo";

      if (!acc[nombre]) {
        acc[nombre] = { nombre, totalGasto: 0, pedidos: 0 };
      }

      acc[nombre].totalGasto += Number(pedido.total || 0);
      acc[nombre].pedidos += 1;
      return acc;
    },
    {},
  );

  // Convertimos a array y tipamos explícitamente
  const listaClientes: ClienteResumen[] = Object.values(resumenClientes);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-inverse">
          Tus Clientes
        </h1>
        <p className="text-text-secondary">
          Historial y resumen de compras de tus clientes.
        </p>
      </div>

      <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-bg-main dark:bg-bg-darker text-text-primary dark:text-text-inverse text-sm border-b border-border dark:border-border-dark">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Total Gastado</th>
              <th className="p-4">Pedidos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {listaClientes.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-text-muted">
                  No hay clientes registrados aún.
                </td>
              </tr>
            ) : (
              listaClientes.map((cliente) => (
                <tr
                  key={cliente.nombre}
                  className="hover:bg-bg-main dark:bg-bg-darker transition-colors"
                >
                  <td className="p-4 text-text-primary dark:text-text-inverse font-medium">
                    {cliente.nombre}
                  </td>
                  <td className="p-4 text-text-secondary">
                    ${cliente.totalGasto.toFixed(2)}
                  </td>
                  <td className="p-4 text-text-secondary">{cliente.pedidos}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
