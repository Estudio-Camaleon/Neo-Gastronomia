import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Obtener contexto del negocio
  const { data: negocios } = await supabase
    .from("negocios")
    .select("id, nombre")
    .eq("user_id", user.id)
    .limit(1);

  const negocio = negocios?.[0] ?? null;
  if (!negocio) redirect("/configuracion");

  const negocioId = negocio.id;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: pedidosHoy },
    { data: ventasData },
    { data: clientesNombres },
    { count: totalProductos },
  ] = await Promise.all([
    supabase
      .from("pedidos")
      .select("*", { count: "exact", head: true })
      .eq("negocio_id", negocioId)
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("pedidos")
      .select("total")
      .eq("negocio_id", negocioId)
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("pedidos")
      .select("cliente_nombre")
      .eq("negocio_id", negocioId)
      .not("cliente_nombre", "is", null),
    supabase
      .from("productos")
      .select("*", { count: "exact", head: true })
      .eq("negocio_id", negocioId),
  ]);

  const ventasHoy =
    ventasData?.reduce((sum, p) => sum + (Number(p.total) || 0), 0) ?? 0;
  const totalClientes = new Set(
    clientesNombres?.map((c) => c.cliente_nombre).filter(Boolean),
  ).size;

  return (
    <div className="space-y-8 z-10 relative">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--admin-text)]">
          Hola, {negocio.nombre} 👋
        </h1>
        <p className="text-[var(--admin-text-muted)] mt-1 font-medium">
          Aquí tienes un resumen de tu negocio el día de hoy.
        </p>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget
          title="Pedidos Hoy"
          value={String(pedidosHoy ?? 0)}
          icon={<ShoppingBag />}
        />
        <KPIWidget
          title="Ventas"
          value={`$${ventasHoy.toLocaleString("es-AR")}`}
          icon={<TrendingUp />}
        />
        <KPIWidget
          title="Clientes"
          value={String(totalClientes ?? 0)}
          icon={<Users />}
        />
        <KPIWidget
          title="Productos"
          value={String(totalProductos ?? 0)}
          icon={<Package />}
        />
      </div>

      {/* Quick Actions (Navegación) */}
      <div className="admin-card p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6 text-[var(--admin-text)]">
          Acceso Rápido
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/productos"
            className="flex-1 flex items-center justify-between bg-[var(--admin-accent)] text-white p-5 rounded-2xl font-semibold shadow-md shadow-[var(--admin-accent)]/20 hover:scale-[1.02] hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <Package size={20} />
              Gestionar Menú
            </div>
            <ArrowRight size={18} />
          </a>
          <a
            href="/pedidos"
            className="flex-1 flex items-center justify-between bg-[var(--admin-surface)] border-2 border-[var(--admin-border)] text-[var(--admin-text)] p-5 rounded-2xl font-semibold hover:border-[var(--admin-accent)] hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-[var(--admin-accent)]" />
              Ver Pedidos
            </div>
            <ArrowRight size={18} className="text-[var(--admin-text-muted)]" />
          </a>
        </div>
      </div>
    </div>
  );
}

function KPIWidget({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="admin-card p-5 flex items-center justify-between group hover:border-[var(--admin-accent)]/50 cursor-default">
      <div>
        <p className="text-sm font-medium text-[var(--admin-text-muted)] mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-[var(--admin-text)]">{value}</p>
      </div>
      <div className="p-3 bg-[var(--admin-surface-accent)]/30 rounded-2xl text-[var(--admin-accent)] group-hover:scale-110 group-hover:bg-[var(--admin-accent)] group-hover:text-white transition-all duration-300">
        {icon}
      </div>
    </div>
  );
}
