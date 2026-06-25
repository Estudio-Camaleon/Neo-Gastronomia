"use server";

import { createClient } from "@/core/lib/supabase/server";
import { getPlanLimits } from "@/core/lib/billing";
import type { PlanTier } from "@/core/lib/billing";
import * as PapaParse from "papaparse";
import ExcelJS from "exceljs";

export interface StatsSummary {
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
  pendientes: number;
  enPreparacion: number;
  entregados: number;
  cancelados: number;
  deliveryCount: number;
  localCount: number;
}

export interface DailyStats {
  date: string;
  orders: number;
  revenue: number;
}

export interface HourlyStats {
  hour: number;
  orders: number;
  revenue: number;
}

export interface PaymentMethodStats {
  method: string;
  orders: number;
  revenue: number;
}

export interface TopProduct {
  nombre_producto: string;
  cantidad: number;
  total: number;
}

export interface CategoryStats {
  categoria: string;
  cantidad: number;
  total: number;
}

export interface CustomerStats {
  totalClientes: number;
  nuevos: number;
  recurrentes: number;
  avgTicket: number;
}

export interface ComparisonData {
  currentRevenue: number;
  previousRevenue: number;
  revenueChange: number;
  currentOrders: number;
  previousOrders: number;
  ordersChange: number;
  currentAvgTicket: number;
  previousAvgTicket: number;
  avgTicketChange: number;
}

export interface ExportRow {
  id: string;
  created_at: string;
  cliente_nombre: string;
  cliente_whatsapp: string | null;
  metodo_pago: string;
  estado: string;
  total: number;
  es_delivery: boolean;
  productos: string;
}

export interface StatsData {
  summary: StatsSummary;
  dailyBreakdown: DailyStats[];
  hourlyBreakdown: HourlyStats[];
  paymentMethods: PaymentMethodStats[];
  topProducts: TopProduct[];
  categoryBreakdown: CategoryStats[];
  customerStats: CustomerStats | null;
  comparison: ComparisonData | null;
  totalCount: number;
}

interface Filters {
  negocioId: string;
  startDate: string;
  endDate: string;
}

function getPeriodDuration(startDate: string, endDate: string): number {
  return new Date(endDate).getTime() - new Date(startDate).getTime();
}

function shiftDate(date: string, durationMs: number): string {
  return new Date(new Date(date).getTime() - durationMs).toISOString();
}

function differencePct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function getStats(filters: Filters): Promise<StatsData> {
  const supabase = await createClient();
  const { negocioId, startDate, endDate } = filters;

  const { data: orders } = await supabase
    .from("pedidos")
    .select("id, total, estado, metodo_pago, created_at, es_delivery, cliente_nombre")
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
    deliveryCount: lista.filter((o) => o.es_delivery).length,
    localCount: lista.filter((o) => !o.es_delivery).length,
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

  const hourlyMap = new Map<number, { orders: number; revenue: number }>();
  for (const o of lista) {
    const hour = new Date(o.created_at).getHours();
    const prev = hourlyMap.get(hour) ?? { orders: 0, revenue: 0 };
    prev.orders += 1;
    prev.revenue += Number(o.total) || 0;
    hourlyMap.set(hour, prev);
  }
  const hourlyBreakdown: HourlyStats[] = Array.from(hourlyMap.entries())
    .map(([hour, data]) => ({ hour, ...data }))
    .sort((a, b) => a.hour - b.hour);

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

  let topProducts: TopProduct[] = [];
  let categoryBreakdown: CategoryStats[] = [];
  if (lista.length > 0) {
    const { data: items } = await supabase
      .from("pedido_items")
      .select("nombre_producto, cantidad, precio_unitario, producto_id")
      .in(
        "pedido_id",
        lista.map((o) => o.id),
      );

    if (items && items.length > 0) {
      const productMap = new Map<
        string,
        { cantidad: number; total: number; id: string | null }
      >();
      for (const item of items) {
        const name = item.nombre_producto ?? "Producto sin nombre";
        const prev = productMap.get(name) ?? {
          cantidad: 0,
          total: 0,
          id: item.producto_id,
        };
        prev.cantidad += item.cantidad;
        prev.total += item.cantidad * Number(item.precio_unitario);
        productMap.set(name, prev);
      }

      topProducts = Array.from(productMap.entries())
        .map(([name, data]) => ({
          nombre_producto: name,
          cantidad: data.cantidad,
          total: data.total,
        }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      const productIds = items
        .map((i) => i.producto_id)
        .filter(Boolean) as string[];
      if (productIds.length > 0) {
        const { data: productos } = await supabase
          .from("productos")
          .select("id, categoria_id")
          .in("id", productIds);

        if (productos) {
          const catMap = new Map<string, string>();
          const catIds = productos
            .map((p) => p.categoria_id)
            .filter(Boolean) as string[];
          if (catIds.length > 0) {
            const { data: categorias } = await supabase
              .from("categorias")
              .select("id, nombre")
              .in("id", catIds);
            if (categorias) {
              for (const c of categorias) {
                catMap.set(c.id, c.nombre);
              }
            }
          }

          const prodCategoria = new Map<string, string | null>();
          for (const p of productos) {
            prodCategoria.set(p.id, p.categoria_id);
          }

          const catBreakMap = new Map<
            string,
            { cantidad: number; total: number }
          >();
          for (const item of items) {
            if (!item.producto_id) continue;
            const catId = prodCategoria.get(item.producto_id) ?? "sin_categoria";
            const catName = catId !== "sin_categoria" ? (catMap.get(catId) ?? "Sin categoría") : "Sin categoría";
            const prev = catBreakMap.get(catName) ?? {
              cantidad: 0,
              total: 0,
            };
            prev.cantidad += item.cantidad;
            prev.total += item.cantidad * Number(item.precio_unitario);
            catBreakMap.set(catName, prev);
          }

          categoryBreakdown = Array.from(catBreakMap.entries())
            .map(([categoria, data]) => ({ categoria, ...data }))
            .sort((a, b) => b.cantidad - a.cantidad);
        }
      }
    }
  }

  let customerStats: CustomerStats | null = null;
  if (lista.length > 0) {
    const uniqueClientIds = lista
      .map((o) => o.cliente_nombre)
      .filter((n): n is string => !!n);
    const uniqueCount = new Set(uniqueClientIds).size;

    const { data: allOrders } = await supabase
      .from("pedidos")
      .select("cliente_nombre, total")
      .eq("negocio_id", negocioId)
      .lt("created_at", startDate);

    const existingClients = new Set(
      (allOrders ?? []).map((o) => o.cliente_nombre).filter(Boolean),
    );
    const nuevos = uniqueClientIds.filter((n) => !existingClients.has(n)).length;
    const recurrentes = uniqueClientIds.filter((n) => existingClients.has(n)).length;

    customerStats = {
      totalClientes: uniqueCount,
      nuevos,
      recurrentes,
      avgTicket: activeOrders > 0 ? totalRevenue / activeOrders : 0,
    };
  }

  let comparison: ComparisonData | null = null;
  if (lista.length > 0) {
    const durationMs = getPeriodDuration(startDate, endDate);
    const prevStart = shiftDate(startDate, durationMs);
    const prevEnd = shiftDate(endDate, durationMs);

    const { data: prevOrders } = await supabase
      .from("pedidos")
      .select("total, estado")
      .eq("negocio_id", negocioId)
      .gte("created_at", prevStart)
      .lte("created_at", prevEnd)
      .limit(5000);

    const prevList = prevOrders ?? [];
    const prevRevenue = prevList.reduce(
      (s, o) =>
        s + (o.estado !== "cancelado" ? Number(o.total) || 0 : 0),
      0,
    );
    const prevActive = prevList.filter((o) => o.estado !== "cancelado").length;

    comparison = {
      currentRevenue: totalRevenue,
      previousRevenue: prevRevenue,
      revenueChange: differencePct(totalRevenue, prevRevenue),
      currentOrders: totalOrders,
      previousOrders: prevList.length,
      ordersChange: differencePct(totalOrders, prevList.length),
      currentAvgTicket: avgTicket,
      previousAvgTicket: prevActive > 0 ? prevRevenue / prevActive : 0,
      avgTicketChange: differencePct(avgTicket, prevActive > 0 ? prevRevenue / prevActive : 0),
    };
  }

  return {
    summary,
    dailyBreakdown,
    hourlyBreakdown,
    paymentMethods,
    topProducts,
    categoryBreakdown,
    customerStats,
    comparison,
    totalCount: lista.length,
  };
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_preparacion: "En preparación",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

function getEstadoLabel(estado: string): string {
  return STATUS_LABELS[estado] ?? estado;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatDateFile(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function buildProductList(
  items: { nombre_producto: string; cantidad: number }[] | null | undefined,
): string {
  return (
    items
      ?.map((item) => `${item.nombre_producto} x${item.cantidad}`)
      .join("; ") ?? ""
  );
}

async function getExportData(filters: Filters) {
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
      `id, created_at, cliente_nombre, cliente_whatsapp, metodo_pago, estado, total, es_delivery,
       pedido_items (nombre_producto, cantidad)`,
    )
    .eq("negocio_id", negocioId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: false });

  return orders ?? [];
}

export async function exportOrdersCSV(
  filters: Filters,
): Promise<{ csv: string; filename: string }> {
  const orders = await getExportData(filters);
  const { startDate, endDate } = filters;

  const rows = orders.map((o) => ({
    ID: o.id,
    Fecha: formatDate(o.created_at),
    Cliente: o.cliente_nombre ?? "Anónimo",
    WhatsApp: o.cliente_whatsapp ?? "",
    Productos: buildProductList(o.pedido_items),
    "Método de pago": o.metodo_pago ?? "-",
    Total: Number(o.total).toFixed(2),
    Estado: getEstadoLabel(o.estado),
    Delivery: o.es_delivery ? "Sí" : "No",
  }));

  if (orders.length > 0) {
    const total = rows.reduce((sum, r) => sum + Number(r.Total), 0);
    rows.push({
      ID: "",
      Fecha: "",
      Cliente: "",
      WhatsApp: "",
      Productos: "",
      "Método de pago": "TOTAL",
      Total: total.toFixed(2),
      Estado: `${orders.length} pedidos`,
      Delivery: "",
    });
  }

  const csv =
    "\uFEFF" +
    PapaParse.unparse({
      fields: ["ID", "Fecha", "Cliente", "WhatsApp", "Productos", "Método de pago", "Total", "Estado", "Delivery"],
      data: rows,
    });

  const filename = `neo_pedidos_${formatDateFile(startDate)}_al_${formatDateFile(endDate)}.csv`;

  return { csv, filename };
}

export async function exportOrdersExcel(
  filters: Filters,
): Promise<{ data: number[]; filename: string }> {
  const orders = await getExportData(filters);
  const { startDate, endDate } = filters;

  const headers = [
    "ID",
    "Fecha",
    "Cliente",
    "WhatsApp",
    "Productos",
    "Método de pago",
    "Total",
    "Estado",
    "Delivery",
  ];

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Pedidos");

  ws.columns = headers.map((h) => ({ header: h, key: h, width: 20 }));
  ws.getRow(1).font = { bold: true };

  let totalSum = 0;

  for (const o of orders) {
    totalSum += Number(o.total);
    ws.addRow({
      ID: o.id,
      Fecha: formatDate(o.created_at),
      Cliente: o.cliente_nombre ?? "Anónimo",
      WhatsApp: o.cliente_whatsapp ?? "",
      Productos: buildProductList(o.pedido_items),
      "Método de pago": o.metodo_pago ?? "-",
      Total: Number(o.total),
      Estado: getEstadoLabel(o.estado),
      Delivery: o.es_delivery ? "Sí" : "No",
    });
  }

  if (orders.length > 0) {
    ws.addRow({
      ID: "",
      Fecha: "",
      Cliente: "",
      WhatsApp: "",
      Productos: "",
      "Método de pago": "TOTAL",
      Total: totalSum,
      Estado: `${orders.length} pedidos`,
      Delivery: "",
    });
    const tr = ws.lastRow!;
    tr.eachCell((c) => { c.font = { bold: true }; });
    tr.getCell("Total").value = totalSum;
    tr.getCell("Total").numFmt = "$#,##0.00";
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1 + orders.length, column: headers.length },
    };
  }

  ws.views = [{ state: "frozen", ySplit: 1 }];

  for (let r = 2; r <= ws.rowCount; r++) {
    const cell = ws.getCell(r, 7);
    if (typeof cell.value === "number") {
      cell.numFmt = "$#,##0.00";
      cell.alignment = { horizontal: "right" };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `neo_pedidos_${formatDateFile(startDate)}_al_${formatDateFile(endDate)}.xlsx`;

  return { data: Array.from(new Uint8Array(buffer)), filename };
}
