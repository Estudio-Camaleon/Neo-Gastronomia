import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  Clock,
  Layers,
  ListChecks,
  ChevronRight,
  Sparkles,
  Percent,
  Settings,
} from "lucide-react";
import { estaAbierto } from "@/core/lib/utils/horarios";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let negocio: { id: string; nombre: string; horarios: unknown } | null = null;

  const { data: negocios } = await supabase
    .from("negocios")
    .select("id, nombre, horarios")
    .eq("user_id", user.id)
    .limit(1);

  negocio = negocios?.[0] ?? null;

  if (!negocio) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberships } = await (supabase.from("team_members" as any) as any)
      .select("negocio_id")
      .eq("user_id", user.id)
      .limit(1);

    if (memberships?.[0]?.negocio_id) {
      const { data: teamNegocio } = await supabase
        .from("negocios")
        .select("id, nombre, horarios")
        .eq("id", memberships[0].negocio_id)
        .limit(1)
        .single();
      negocio = teamNegocio ?? null;
    }
  }

  if (!negocio) redirect("/configuracion");

  const negocioId = negocio.id;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { data: pedidosHoy },
    { data: ventasData },
    { data: clientesNombres },
    { count: totalProductos },
    { count: totalCategorias },
  ] = await Promise.all([
    supabase
      .from("pedidos")
      .select("id, estado, total, cliente_nombre, created_at")
      .eq("negocio_id", negocioId)
      .gte("created_at", todayStart.toISOString())
      .order("created_at", { ascending: false }),
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
    supabase
      .from("categorias")
      .select("*", { count: "exact", head: true })
      .eq("negocio_id", negocioId),
  ]);

  const listaPedidos = pedidosHoy ?? [];
  const ventasHoy =
    ventasData?.reduce((sum, p) => sum + (Number(p.total) || 0), 0) ?? 0;
  const totalClientes = new Set(
    clientesNombres?.map((c) => c.cliente_nombre).filter(Boolean),
  ).size;

  const pendientes = listaPedidos.filter(
    (p) => p.estado === "pendiente",
  ).length;
  const enPreparacion = listaPedidos.filter(
    (p) => p.estado === "en_preparacion",
  ).length;
  const entregados = listaPedidos.filter(
    (p) => p.estado === "entregado",
  ).length;
  const cancelados = listaPedidos.filter(
    (p) => p.estado === "cancelado",
  ).length;

  const abierto =
    negocio.horarios !== null && negocio.horarios !== undefined
      ? estaAbierto(negocio.horarios)
      : null;
  const pedidosRecientes = listaPedidos.slice(0, 5);
  const esNuevoNegocio = (totalProductos ?? 0) === 0;
  const ticketPromedio =
    listaPedidos.length > 0 ? ventasHoy / listaPedidos.length : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--admin-text)]">
            Hola, {negocio.nombre} 👋
          </h1>
          <p className="text-[var(--admin-text-muted)] text-sm font-medium capitalize">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <LocalStatusBadge abierto={abierto} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget
          title="Pedidos Hoy"
          value={String(listaPedidos.length)}
          icon={<ShoppingBag />}
        />
        <KPIWidget
          title="Ventas"
          value={`$${ventasHoy.toLocaleString("es-AR")}`}
          icon={<TrendingUp />}
        />
        <KPIWidget
          title="Clientes"
          value={String(totalClientes)}
          icon={<Users />}
        />
        <KPIWidget
          title="Catálogo"
          value={`${totalProductos ?? 0} ítems`}
          icon={<Package />}
        />
      </div>

      {esNuevoNegocio && (
        <div className="admin-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-br from-[var(--admin-accent)]/5 to-transparent">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[var(--admin-text)]">
              ¡Bienvenido a NEO! 🚀
            </h2>
            <p className="text-sm font-medium text-[var(--admin-text-muted)] max-w-lg">
              Comienza configurando tu menú para recibir tus primeros pedidos.
              Agrega productos, categorías y personaliza tu catálogo público.
            </p>
          </div>
          <a
            href="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--admin-accent)] text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all shrink-0"
          >
            <Package size={18} />
            Configurar menú
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 admin-card p-6">
          <h2 className="text-lg font-bold text-[var(--admin-text)] mb-5 flex items-center gap-2">
            <Layers size={18} className="text-[var(--admin-accent)]" />
            Pipeline de Pedidos
          </h2>
          {listaPedidos.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              <PipelineBadge
                label="Pendientes"
                value={pendientes}
                color="amber"
              />
              <PipelineBadge
                label="Preparación"
                value={enPreparacion}
                color="blue"
              />
              <PipelineBadge
                label="Entregados"
                value={entregados}
                color="green"
              />
              <PipelineBadge
                label="Cancelados"
                value={cancelados}
                color="red"
              />
            </div>
          ) : (
            <p className="text-sm text-[var(--admin-text-muted)] italic">
              Sin pedidos registrados hoy.
            </p>
          )}
        </div>

        <div className="admin-card p-6">
          <h2 className="text-lg font-bold text-[var(--admin-text)] mb-5 flex items-center gap-2">
            <ListChecks size={18} className="text-[var(--admin-accent)]" />
            Resumen del Día
          </h2>
          <div className="space-y-4">
            <ResumenRow
              label="Productos en catálogo"
              value={String(totalProductos ?? 0)}
            />
            <ResumenRow
              label="Secciones"
              value={String(totalCategorias ?? 0)}
            />
            <ResumenRow
              label="Ticket promedio"
              value={`$${ticketPromedio.toFixed(2)}`}
            />
            <ResumenRow
              label="Delivery / Local"
              value={`${listaPedidos.filter((p) => p.estado !== "cancelado").length} activos`}
            />
          </div>
        </div>
      </div>

      {pedidosRecientes.length > 0 && (
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[var(--admin-text)] flex items-center gap-2">
              <ShoppingBag size={18} className="text-[var(--admin-accent)]" />
              Órdenes Recientes
            </h2>
            <a
              href="/pedidos"
              className="text-xs font-semibold text-[var(--admin-accent)] hover:underline flex items-center gap-1"
            >
              Ver todas <ChevronRight size={14} />
            </a>
          </div>
          <div className="divide-y divide-[var(--admin-border)]">
            {pedidosRecientes.map((pedido) => (
              <div
                key={pedido.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <StatusDot estado={pedido.estado} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--admin-text)]">
                      {pedido.cliente_nombre || "Anónimo"}
                    </p>
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      {new Date(pedido.created_at).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--admin-text)]">
                    ${Number(pedido.total).toFixed(2)}
                  </p>
                  <EstadoLabel estado={pedido.estado} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <PromoCard />
        <QuickActionsCard />
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
      <div className="p-3 bg-[var(--admin-accent)]/10 rounded-2xl text-[var(--admin-accent)] group-hover:scale-110 group-hover:bg-[var(--admin-accent)] group-hover:text-white transition-all duration-300">
        {icon}
      </div>
    </div>
  );
}

function LocalStatusBadge({
  abierto,
}: {
  abierto: boolean | null;
}) {
  if (abierto === null) {
    return (
      <a
        href="/configuracion"
        className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-dashed border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)] transition-all"
      >
        <Clock size={14} />
        Configurar horarios
      </a>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${
        abierto
          ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
          : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          abierto ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {abierto ? "Abierto ahora" : "Cerrado"}
    </div>
  );
}

function PipelineBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "amber" | "blue" | "green" | "red";
}) {
  const colorMap = {
    amber: {
      bg: "bg-amber-500/15 dark:bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/25 dark:border-amber-500/20",
      dot: "bg-amber-500",
    },
    blue: {
      bg: "bg-blue-500/15 dark:bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/25 dark:border-blue-500/20",
      dot: "bg-blue-500",
    },
    green: {
      bg: "bg-green-500/15 dark:bg-green-500/10",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-500/25 dark:border-green-500/20",
      dot: "bg-green-500",
    },
    red: {
      bg: "bg-red-500/15 dark:bg-red-500/10",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-500/25 dark:border-red-500/20",
      dot: "bg-red-500",
    },
  };

  const c = colorMap[color];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${c.bg} ${c.border} border rounded-xl p-4`}
    >
      <span className={`text-3xl font-black ${c.text} leading-none`}>
        {value}
      </span>
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-muted)]">
          {label}
        </span>
      </div>
    </div>
  );
}

function ResumenRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-[var(--admin-text-muted)]">
        {label}
      </span>
      <span className="text-sm font-bold text-[var(--admin-text)]">{value}</span>
    </div>
  );
}

function StatusDot({ estado }: { estado: string }) {
  const colorMap: Record<string, string> = {
    pendiente: "bg-amber-500",
    en_preparacion: "bg-blue-500",
    entregado: "bg-green-500",
    cancelado: "bg-red-500",
  };

  return (
    <span
      className={`w-2 h-2 rounded-full shrink-0 ${colorMap[estado] || "bg-gray-400"}`}
    />
  );
}

function EstadoLabel({ estado }: { estado: string }) {
  const labels: Record<string, string> = {
    pendiente: "Pendiente",
    en_preparacion: "Preparando",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };

  return (
    <span className="text-[10px] font-semibold text-[var(--admin-text-muted)]">
      {labels[estado] || estado}
    </span>
  );
}

function PromoCard() {
  return (
    <div className="admin-card p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/20 text-purple-500">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--admin-text)]">
              Promociones
            </h2>
            <p className="text-xs text-[var(--admin-text-muted)] font-medium">
              Atrae más clientes con ofertas
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
          Nuevo
        </span>
      </div>

      <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
            <Percent size={20} className="text-purple-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[var(--admin-text)]">
              Gestioná tus ofertas
            </p>
            <p className="text-xs text-[var(--admin-text-muted)]">
              Porcentajes, montos fijos y códigos promocionales
            </p>
          </div>
        </div>
      </div>

      <a
        href="/promos"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-[var(--admin-border)] text-sm font-semibold text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)] transition-all"
      >
        <Sparkles size={15} />
        Administrar promociones
      </a>
    </div>
  );
}

function QuickActionsCard() {
  return (
    <div className="admin-card p-6">
      <h2 className="text-lg font-bold text-[var(--admin-text)] mb-5 flex items-center gap-2">
        <Layers size={18} className="text-[var(--admin-accent)]" />
        Acceso Rápido
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <a
          href="/pedidos"
          className="flex items-center gap-3 p-4 rounded-xl bg-[var(--admin-accent)]/10 border border-[var(--admin-accent)]/20 text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/20 hover:scale-[1.02] transition-all"
        >
          <ShoppingBag size={18} />
          <span className="text-sm font-bold">Pedidos</span>
        </a>
        <a
          href="/productos"
          className="flex items-center gap-3 p-4 rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:border-[var(--admin-accent)]/30 hover:bg-[var(--admin-accent)]/5 transition-all"
        >
          <Package size={18} />
          <span className="text-sm font-bold">Menú</span>
        </a>
        <a
          href="/clientes"
          className="flex items-center gap-3 p-4 rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:border-[var(--admin-accent)]/30 hover:bg-[var(--admin-accent)]/5 transition-all"
        >
          <Users size={18} />
          <span className="text-sm font-bold">Clientes</span>
        </a>
        <a
          href="/configuracion"
          className="flex items-center gap-3 p-4 rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:border-[var(--admin-accent)]/30 hover:bg-[var(--admin-accent)]/5 transition-all"
        >
          <Settings size={18} />
          <span className="text-sm font-bold">Ajustes</span>
        </a>
      </div>
    </div>
  );
}
