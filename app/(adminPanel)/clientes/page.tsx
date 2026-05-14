import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { ClientRadar } from "@/components/adminPanel/clientes/ClientRadar";

// Interfaces se mantienen igual por ahora
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

  if (!negocio) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-black uppercase bg-red-500 text-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          Negocio no configurado
        </h2>
      </div>
    );
  }

  // Traemos pedidos (Optimizado: solo campos necesarios)
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("cliente_nombre, total")
    .eq("negocio_id", negocio.id);

  // Procesamiento de datos (Lógica de Negocio)
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

  const listaClientes = Object.values(resumenClientes).sort(
    (a, b) => b.totalGasto - a.totalGasto,
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--admin-accent)] p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Users size={24} className="text-white" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--admin-accent)]">
            Insights de Clientes
          </span>
        </div>

        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-[0.8] mb-4">
            Tu <br /> Comunidad
          </h1>
          <p className="max-w-xl text-sm font-bold uppercase text-gray-500 border-l-4 border-black pl-4">
            Analizá quiénes son tus clientes más fieles y su comportamiento de
            compra histórico.
          </p>
        </div>
      </header>

      <main>
        <ClientRadar initialClientes={listaClientes} />
      </main>
    </div>
  );
}
