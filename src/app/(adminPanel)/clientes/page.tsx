import { createClient } from "@/core/lib/supabase/server";
import { Users, AlertTriangle } from "lucide-react";
import { ClientRadar } from "@/features/admin/clients/ClientRadar";
import type { ClienteResumen } from "@/core/types/domain";

export default async function ClientesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let negocio: { id: string } | null = null;

  const { data: negocios } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user?.id ?? "")
    .limit(1);

  negocio = negocios?.[0] ?? null;

  if (!negocio) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberships } = await (supabase.from("team_members" as any) as any)
      .select("negocio_id")
      .eq("user_id", user?.id ?? "")
      .limit(1);

    if (memberships?.[0]?.negocio_id) {
      const { data: teamNegocio } = await supabase
        .from("negocios")
        .select("id")
        .eq("id", memberships[0].negocio_id)
        .limit(1)
        .single();
      negocio = teamNegocio ?? null;
    }
  }

  if (!negocio) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] relative z-10 p-4">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-4 shadow-sm max-w-xl">
          <AlertTriangle size={24} className="shrink-0" />
          <h2 className="text-sm font-semibold tracking-wide">
            Infraestructura Tenant Incompleta. Por favor, configura tu local
            desde la sección de ajustes.
          </h2>
        </div>
      </div>
    );
  }

  // 2. Intentar traer clientes registrados + pedidos para métricas
  const [{ data: clientesBD }, { data: pedidos }] = await Promise.all([
    supabase.from("clientes").select("*").eq("negocio_id", negocio.id),
    supabase
      .from("pedidos")
      .select("cliente_nombre, total, cliente_whatsapp")
      .eq("negocio_id", negocio.id),
  ]);

  // 3. Mapa: clientes registrados por nombre normalizado
  const clientesMap = new Map<string, ClienteResumen>();
  for (const cli of clientesBD ?? []) {
    const key = cli.nombre.trim().toUpperCase();
    clientesMap.set(key, {
      id: cli.id,
      nombre: key,
      telefono: cli.telefono,
      email: cli.email,
      totalGasto: 0,
      pedidos: 0,
      notas: cli.notas,
    });
  }

  // 4. Agregar métricas desde pedidos
  for (const pedido of pedidos ?? []) {
    const nombreLimpio =
      pedido.cliente_nombre?.trim().toUpperCase() || "CONSUMIDOR ANÓNIMO";
    const existente = clientesMap.get(nombreLimpio);
    if (existente) {
      existente.totalGasto += Number(pedido.total || 0);
      existente.pedidos += 1;
    } else {
      clientesMap.set(nombreLimpio, {
        id: `virtual_${crypto.randomUUID()}`,
        nombre: nombreLimpio,
        telefono: pedido.cliente_whatsapp || null,
        email: null,
        totalGasto: Number(pedido.total || 0),
        pedidos: 1,
        notas: null,
      });
    }
  }

  const listaClientes = Array.from(clientesMap.values()).sort(
    (a, b) => b.totalGasto - a.totalGasto,
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative z-10 transition-colors duration-200">
      {/* HEADER DE COMUNIDAD */}
      <header className="space-y-4 border-b border-[var(--admin-border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--admin-accent)] text-white p-2.5 rounded-xl shadow-sm shadow-[var(--admin-accent)]/20">
            <Users size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)]">
            Métricas de Comunidad
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-[var(--admin-text)]">
            Tus Clientes
          </h1>
          <p className="max-w-2xl text-sm font-medium text-[var(--admin-text-muted)] border-l-2 border-[var(--admin-accent)] pl-4 leading-relaxed">
            Análisis de volumen de compra, ranking de retención y seguimiento
            analítico de usuarios en tu plataforma.
          </p>
        </div>
      </header>

      {/* RENDER DEL SUB-MÓDULO INTEGRADOR UNIFICADO */}
      <main>
        <ClientRadar initialClientes={listaClientes} />
      </main>
    </div>
  );
}
