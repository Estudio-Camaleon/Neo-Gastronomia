import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAdminNegocioContext } from "@/core/lib/tenant";
import { Users } from "lucide-react";
import { ClientRadar } from "@/features/admin/clients/ClientRadar";
import type { ClienteResumen } from "@/core/types/domain";

export default async function ClientesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { negocioId } = await getAdminNegocioContext(
    supabase,
    user.id,
    "id",
  );
  if (!negocioId) redirect("/configuracion");

  // 2. Intentar traer clientes registrados + pedidos para métricas
  const [{ data: clientesBD }, { data: pedidos }] = await Promise.all([
    supabase.from("clientes").select("*").eq("negocio_id", negocioId),
    supabase
      .from("pedidos")
      .select("cliente_nombre, total, cliente_whatsapp, created_at")
      .eq("negocio_id", negocioId),
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
      ultimoPedido: null,
      notas: cli.notas,
    });
  }

  // 4. Agregar métricas desde pedidos
  for (const pedido of pedidos ?? []) {
    const nombreLimpio =
      pedido.cliente_nombre?.trim().toUpperCase() || "CONSUMIDOR ANÓNIMO";
    const fechaPedido = pedido.created_at || null;
    const existente = clientesMap.get(nombreLimpio);
    if (existente) {
      existente.totalGasto += Number(pedido.total || 0);
      existente.pedidos += 1;
      if (fechaPedido && (!existente.ultimoPedido || fechaPedido > existente.ultimoPedido)) {
        existente.ultimoPedido = fechaPedido;
      }
    } else {
      // ID virtual estable: hash simple basado en nombre+telefono
      const stableKey = `${nombreLimpio}_${pedido.cliente_whatsapp || "sin-tel"}`;
      const virtualId = Array.from(stableKey).reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0);
      clientesMap.set(nombreLimpio, {
        id: `virtual_${Math.abs(virtualId).toString(36)}`,
        nombre: nombreLimpio,
        telefono: pedido.cliente_whatsapp || null,
        email: null,
        totalGasto: Number(pedido.total || 0),
        pedidos: 1,
        ultimoPedido: fechaPedido,
        notas: null,
      });
    }
  }

  const listaClientes = Array.from(clientesMap.values()).sort(
    (a, b) => b.totalGasto - a.totalGasto,
  );

  return (
    <div className="space-y-8 relative z-10 transition-colors duration-200">
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
