"use server";

import { createClient } from "@/core/lib/supabase/server";
import { getPlanLimits } from "@/core/lib/billing";
import type { PlanTier } from "@/core/lib/billing";

export interface StatsSummary {
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
  pendientes: number;
  enPreparacion: number;
  entregados: number;
  cancelados: number;
}

export interface DailyStats {
  date: string;
  orders: number;
  revenue: number;
}

export interface PaymentMethodStats {
  method: string;
  orders: number;
  revenue: number;
}

export interface ExportRow {
  id: string;
  created_at: string;
  cliente_nombre: string;
  metodo_pago: string;
  estado: string;
  total: number;
  es_delivery: boolean;
  productos: string;
}

export interface StatsData {
  summary: StatsSummary;
  dailyBreakdown: DailyStats[];
  paymentMethods: PaymentMethodStats[];
  totalCount: number;
}

interface Filters {
  negocioId: string;
  startDate: string;
  endDate: string;
}

export async function getStats(filters: Filters): Promise<StatsData> {
  const supabase = await createClient();
  const { negocioId, startDate, endDate } = filters;

  const { data: orders } = await supabase
    .from("pedidos")
    .select("id, total, estado, metodo_pago, created_at")
    .eq("negocio_id", negocioId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: false })
    .limit(5000);

  const lista = orders ?? [];

  const totalRevenue = lista.reduce(
    (sum, o) => sum + (o.estado !== "cancelado" ? Number(o.total) || 0 : 0),
    0,
  );
  const totalOrders = lista.length;
  const activeOrders = lista.filter((o) => o.estado !== "cancelado").length;
  const avgTicket = activeOrders > 0 ? totalRevenue / activeOrders : 0;

  const summary: StatsSummary = {
    totalRevenue,
    totalOrders,
    avgTicket,
    pendientes: lista.filter((o) => o.estado === "pendiente").length,
    enPreparacion: lista.filter((o) => o.estado === "en_preparacion").length,
    entregados: lista.filter((o) => o.estado === "entregado").length,
    cancelados: lista.filter((o) => o.estado === "cancelado").length,
  };

  const dailyMap = new Map<string, { orders: number; revenue: number }>();
  for (const o of lista) {
    const day = o.created_at.split("T")[0];
    const prev = dailyMap.get(day) ?? { orders: 0, revenue: 0 };
    prev.orders += 1;
    prev.revenue += Number(o.total) || 0;
    dailyMap.set(day, prev);
  }
  const dailyBreakdown: DailyStats[] = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const methodMap = new Map<string, { orders: number; revenue: number }>();
  for (const o of lista) {
    const method = o.metodo_pago ?? "Sin especificar";
    const prev = methodMap.get(method) ?? { orders: 0, revenue: 0 };
    prev.orders += 1;
    prev.revenue += Number(o.total) || 0;
    methodMap.set(method, prev);
  }
  const paymentMethods: PaymentMethodStats[] = Array.from(
    methodMap.entries(),
  ).map(([method, data]) => ({ method, ...data }));

  return {
    summary,
    dailyBreakdown,
    paymentMethods,
    totalCount: lista.length,
  };
}

export async function exportOrdersCSV(
  filters: Filters,
): Promise<{ csv: string; filename: string }> {
  const supabase = await createClient();
  const { negocioId, startDate, endDate } = filters;

  const { data: negocio } = await supabase
    .from("negocios")
    .select("plan_tier")
    .eq("id", negocioId)
    .limit(1)
    .single();

  const tier = (negocio?.plan_tier as PlanTier) ?? "free";
  const limits = getPlanLimits(tier);
  if (!limits.exportData) {
    throw new Error(
      "La exportación de datos está disponible solo en el plan PRO. Actualizá para acceder.",
    );
  }

  const { data: orders } = await supabase
    .from("pedidos")
    .select(
      `
      id, created_at, cliente_nombre, metodo_pago, estado, total, es_delivery,
      pedido_items (nombre_producto, cantidad)
    `,
    )
    .eq("negocio_id", negocioId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: false });

  const rows: string[] = [
    "ID,Pedido,Fecha,Cliente,Productos,Pago,Total,Estado,Delivery",
  ];

  for (const o of orders ?? []) {
    const productos =
      o.pedido_items
        ?.map(
          (item: { nombre_producto: string; cantidad: number }) =>
            `${item.nombre_producto} x${item.cantidad}`,
        )
        .join("; ") ?? "";

    const row = [
      o.id,
      new Date(o.created_at).toLocaleString("es-AR"),
      `"${(o.cliente_nombre ?? "Anónimo").replace(/"/g, '""')}"`,
      `"${productos.replace(/"/g, '""')}"`,
      o.metodo_pago ?? "-",
      Number(o.total).toFixed(2),
      o.estado,
      o.es_delivery ? "Sí" : "No",
    ].join(",");

    rows.push(row);
  }

  const filename = `neo_export_${startDate}_${endDate}.csv`;

  return { csv: rows.join("\n"), filename };
}
