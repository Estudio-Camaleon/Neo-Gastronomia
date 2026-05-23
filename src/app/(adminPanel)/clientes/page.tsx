import { createClient } from "@/core/lib/supabase/server";
import { Users, AlertTriangle } from "lucide-react";
import {
  ClientRadar,
  type ClienteResumen,
} from "@/features/admin/clients/ClientRadar";

export default async function ClientesPage() {
  const supabase = await createClient();

  // 1. Extracción de contexto asumiendo layout seguro
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user?.id)
    .single();

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

  // 2. Traemos comandas de forma limpia para cálculo asíncrono
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("cliente_nombre, total, cliente_whatsapp")
    .eq("negocio_id", negocio.id);

  // 3. Motor de agregación de datos con Tipado Estricto (Cero Warnings)
  const resumenClientes = (pedidos || []).reduce<
    Record<string, ClienteResumen>
  >((acc, pedido) => {
    const nombreLimpio =
      pedido.cliente_nombre?.trim().toUpperCase() || "CONSUMIDOR ANÓNIMO";
    const whatsapp = pedido.cliente_whatsapp || null;

    if (!acc[nombreLimpio]) {
      acc[nombreLimpio] = {
        id: crypto.randomUUID(), // Nota: Si implementás auth relacional de clientes, usar ID real de Supabase Auth
        nombre: nombreLimpio,
        telefono: whatsapp,
        email: null,
        totalGasto: 0,
        pedidos: 0,
        notas: null,
      };
    }

    acc[nombreLimpio].totalGasto += Number(pedido.total || 0);
    acc[nombreLimpio].pedidos += 1;
    return acc;
  }, {});

  const listaClientes = Object.values(resumenClientes).sort(
    (a, b) => b.totalGasto - a.totalGasto,
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto relative z-10 transition-colors duration-200">
      {/* HEADER DE COMUNIDAD */}
      <header className="space-y-4 border-b border-[var(--admin-border)] dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--admin-accent)] text-white p-2.5 rounded-xl shadow-sm shadow-[var(--admin-accent)]/20">
            <Users size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-muted)] dark:text-zinc-400">
            Métricas de Comunidad
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--admin-text)] dark:text-zinc-100">
            Tus Clientes
          </h1>
          <p className="max-w-2xl text-sm font-medium text-[var(--admin-text-muted)] dark:text-zinc-400 border-l-2 border-[var(--admin-accent)] pl-4 leading-relaxed">
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
