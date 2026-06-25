"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download,
  FileSpreadsheet,
  Wallet,
  AlertCircle,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Users,
  Store,
  MapPin,
  TrendingUp,
  ShoppingBag,
  XCircle,
  Package,
  Calendar,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { FoodMini } from "@/components/ui/food-loading";
import { getStats, exportOrdersCSV, exportOrdersExcel } from "../actions";
import type {
  StatsData,
  StatsSummary,
  TopProduct,
  CategoryStats,
  CustomerStats,
  ComparisonData,
  DailyStats,
  HourlyStats,
  PaymentMethodStats,
} from "../actions";
import { toast } from "sonner";

type Period = "today" | "week" | "month" | "year" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Hoy",
  week: "Esta semana",
  month: "Este mes",
  year: "Este año",
  all: "Todo el historial",
};

function getPeriodRange(period: Period): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString();
  let start: Date;

  switch (period) {
    case "today": {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      break;
    }
    case "week": {
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    }
    case "month": {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case "year": {
      start = new Date(now.getFullYear(), 0, 1);
      break;
    }
    case "all": {
      start = new Date(0);
      break;
    }
  }

  return { startDate: start.toISOString(), endDate };
}

const CHART_COLORS = [
  "var(--admin-accent)",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#ec4899",
];
const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

function formatCurrency(n: number): string {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

function formatChange(n: number): { text: string; positive: boolean } {
  const sign = n >= 0 ? "+" : "";
  return { text: `${sign}${n.toFixed(1)}%`, positive: n >= 0 };
}

interface StatsDashboardProps {
  negocioId: string;
}

export function StatsDashboard({ negocioId }: StatsDashboardProps) {
  const [period, setPeriod] = useState<Period>("month");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const range = getPeriodRange(period);
        const result = await getStats({ negocioId, ...range });
        if (!cancelled) {
          setData(result);
        }
      } catch {
        if (!cancelled) {
          toast.error("Error al cargar estadísticas");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [period, negocioId]);

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
  };

  const handleExport = async (format: "csv" | "excel") => {
    setExporting(format);
    try {
      const range = getPeriodRange(period);
      if (format === "csv") {
        const { csv, filename } = await exportOrdersCSV({
          negocioId,
          ...range,
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exportación CSV completada`);
      } else {
        const { data, filename } = await exportOrdersExcel({
          negocioId,
          ...range,
        });
        const blob = new Blob([new Uint8Array(data)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exportación Excel completada`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al exportar",
      );
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-8" ref={dashboardRef}>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--admin-text)]">
            Estadísticas
          </h1>
          <p className="text-[var(--admin-text-muted)] text-sm font-medium">
            Control de ventas y rendimiento del negocio.
          </p>
        </div>

        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu((v) => !v)}
            disabled={exporting !== null || !data || data.totalCount === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-accent)] text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Exportar datos"
            aria-haspopup="true"
            aria-expanded={showExportMenu}
          >
            {exporting ? (
              <>
                <span className="animate-pulse">●</span>
                Exportando...
              </>
            ) : (
              <>
                <Download size={16} />
                Exportar
              </>
            )}
          </button>

          {showExportMenu && !exporting && (
            <div
              className="absolute right-0 mt-2 w-52 py-1 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-xl z-20 overflow-hidden"
              role="menu"
            >
              <button
                onClick={() => {
                  handleExport("csv");
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-accent)]/5 transition-colors"
                role="menuitem"
              >
                <Download size={16} className="shrink-0" />
                <span className="flex flex-col items-start">
                  <span>CSV</span>
                  <span className="text-[10px] font-normal text-[var(--admin-text-muted)]">
                    Compatible con Excel
                  </span>
                </span>
              </button>
              <div className="h-px bg-[var(--admin-border)] mx-3" />
              <button
                onClick={() => {
                  handleExport("excel");
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-accent)]/5 transition-colors"
                role="menuitem"
              >
                <FileSpreadsheet size={16} className="shrink-0" />
                <span className="flex flex-col items-start">
                  <span>Excel</span>
                  <span className="text-[10px] font-normal text-[var(--admin-text-muted)]">
                    .xlsx con estilos
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PERIOD SELECTOR */}
      <div className="flex flex-wrap gap-2 bg-[var(--admin-bg)] p-1.5 rounded-xl border border-[var(--admin-border)] w-fit">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-2 sm:px-3.5 py-2 text-[10px] sm:text-xs font-bold whitespace-nowrap rounded-lg transition-all ${
              period === p
                ? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-xs border border-[var(--admin-border)]"
                : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <FoodMini size={20} />
            </div>
            <p className="text-sm font-medium text-[var(--admin-text-muted)]">
              Cargando estadísticas...
            </p>
          </div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* COMPARISON BANNER */}
          {data.comparison && <ComparisonBanner comparison={data.comparison} />}

          {/* SUMMARY CARDS */}
          <SummaryCards summary={data.summary} />

          {/* TOP PRODUCT + CUSTOMER STATS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {data.topProducts.length > 0 && (
              <TopProductsCard products={data.topProducts} />
            )}
            {data.customerStats && (
              <CustomerStatsCard stats={data.customerStats} />
            )}
            <div className="flex flex-col gap-6">
              <DeliveryCard summary={data.summary} />
              <StatusDonut summary={data.summary} />
            </div>
          </div>

          {/* CHARTS ROW 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={data.dailyBreakdown} />
            <HourlyChart data={data.hourlyBreakdown} />
          </div>

          {/* CHARTS ROW 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentMethodsChart methods={data.paymentMethods} />
            {data.categoryBreakdown.length > 0 && (
              <CategoryChart data={data.categoryBreakdown} />
            )}
          </div>

          {/* DAILY TABLE */}
          <DailyTable
            breakdown={data.dailyBreakdown}
            totalCount={data.totalCount}
          />
        </>
      )}

      {/* EMPTY STATE */}
      {data && data.totalCount === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 admin-card border-dashed">
          <div className="p-4 rounded-2xl bg-[var(--admin-accent)]/5 text-[var(--admin-text-muted)] mb-4">
            <AlertCircle size={48} strokeWidth={1.5} />
          </div>
          <p className="text-lg font-black tracking-tight text-[var(--admin-text)] mb-1">
            Sin datos en este período
          </p>
          <p className="text-sm font-medium text-[var(--admin-text-muted)]">
            No hay pedidos registrados en el rango seleccionado.
          </p>
        </div>
      )}
    </div>
  );
}

function formatPeriodLabel(startDate: string, endDate: string): string {
  const s = new Date(startDate);
  const e = new Date(endDate);
  return `${s.toLocaleDateString("es-AR")} - ${e.toLocaleDateString("es-AR")}`;
}

function ComparisonBanner({
  comparison,
}: {
  comparison: ComparisonData;
}) {
  const items = [
    { label: "Ingresos", current: comparison.currentRevenue, previous: comparison.previousRevenue, change: comparison.revenueChange, fmt: formatCurrency },
    { label: "Pedidos", current: comparison.currentOrders, previous: comparison.previousOrders, change: comparison.ordersChange, fmt: (n: number) => String(n) },
    { label: "Ticket Prom.", current: comparison.currentAvgTicket, previous: comparison.previousAvgTicket, change: comparison.avgTicketChange, fmt: formatCurrency },
  ];

  return (
    <div className="admin-card p-5 border-[var(--admin-accent)]/20 bg-gradient-to-r from-[var(--admin-accent)]/5 to-transparent">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-[var(--admin-accent)]" />
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">
          Vs. período anterior
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => {
          const ch = formatChange(item.change);
          return (
            <div key={item.label} className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
              <span className="text-xs font-medium text-[var(--admin-text-muted)]">
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--admin-text)]">
                  {item.fmt(item.current)}
                </span>
                <span
                  className={`flex items-center gap-0.5 text-[10px] font-bold ${
                    ch.positive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {ch.positive ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <ArrowDownRight size={12} />
                  )}
                  {ch.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCards({ summary }: { summary: StatsSummary }) {
  const cards = [
    {
      title: "Ingresos Totales",
      value: formatCurrency(summary.totalRevenue),
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10",
    },
    {
      title: "Pedidos",
      value: String(summary.totalOrders),
      subtitle: `${summary.entregados} entregados · ${summary.cancelados} cancelados`,
      icon: ShoppingBag,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Ticket Promedio",
      value: formatCurrency(summary.avgTicket),
      icon: Wallet,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Cancelados",
      value: String(summary.cancelados),
      subtitle:
        summary.totalOrders > 0
          ? `${((summary.cancelados / summary.totalOrders) * 100).toFixed(1)}% del total`
          : "0% del total",
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="admin-card p-5 group hover:border-[var(--admin-accent)]/50 cursor-default"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-[var(--admin-text-muted)]">
                {card.title}
              </p>
              <div
                className={`p-2.5 rounded-xl ${card.bg} ${card.color} transition-all duration-200 group-hover:scale-110`}
              >
                <Icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--admin-text)]">
              {card.value}
            </p>
            {card.subtitle && (
              <p className="text-xs font-medium text-[var(--admin-text-muted)] mt-1">
                {card.subtitle}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getStatusColor(
  status: string,
): { fill: string; bg: string; label: string } {
  const map: Record<string, { fill: string; bg: string; label: string }> = {
    pendiente: {
      fill: "#f59e0b",
      bg: "bg-amber-500/10",
      label: "Pendiente",
    },
    en_preparacion: {
      fill: "#3b82f6",
      bg: "bg-blue-500/10",
      label: "Preparación",
    },
    entregado: {
      fill: "#22c55e",
      bg: "bg-green-500/10",
      label: "Entregado",
    },
    cancelado: {
      fill: "#ef4444",
      bg: "bg-red-500/10",
      label: "Cancelado",
    },
  };
  return (
    map[status] ?? {
      fill: "#64748b",
      bg: "bg-gray-500/10",
      label: status,
    }
  );
}

function StatusDonut({ summary }: { summary: StatsSummary }) {
  const items = [
    { name: "Pendientes", value: summary.pendientes, color: "#f59e0b" },
    { name: "Preparación", value: summary.enPreparacion, color: "#3b82f6" },
    { name: "Entregados", value: summary.entregados, color: "#22c55e" },
    { name: "Cancelados", value: summary.cancelados, color: "#ef4444" },
  ].filter((i) => i.value > 0);

  if (items.length === 0) return null;

  return (
    <div className="admin-card p-5">
      <h2 className="text-sm font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <ShoppingBag size={16} className="text-[var(--admin-accent)]" />
        Estado de Pedidos
      </h2>
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie
                data={items}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={45}
                dataKey="value"
                strokeWidth={0}
              >
                {items.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[var(--admin-text-muted)]">{item.name}</span>
              </span>
              <span className="font-semibold text-[var(--admin-text)]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeliveryCard({ summary }: { summary: StatsSummary }) {
  const total = summary.deliveryCount + summary.localCount;
  if (total === 0) return null;

  const deliveryPct = ((summary.deliveryCount / total) * 100).toFixed(0);
  const localPct = ((summary.localCount / total) * 100).toFixed(0);

  return (
    <div className="admin-card p-5">
      <h2 className="text-sm font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <MapPin size={16} className="text-[var(--admin-accent)]" />
        Delivery vs Local
      </h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-[var(--admin-text-muted)]">
            <Store size={12} />
            Local
          </span>
          <span className="text-sm font-bold text-[var(--admin-text)]">
            {summary.localCount} ({localPct}%)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-[var(--admin-text-muted)]">
            <MapPin size={12} />
            Delivery
          </span>
          <span className="text-sm font-bold text-[var(--admin-text)]">
            {summary.deliveryCount} ({deliveryPct}%)
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--admin-bg)] overflow-hidden flex">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${localPct}%` }}
          />
          <div
            className="h-full bg-[var(--admin-accent)] transition-all"
            style={{ width: `${deliveryPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data: DailyStats[] }) {
  if (data.length === 0) return null;

  return (
    <div className="admin-card p-5">
      <h2 className="text-sm font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-[var(--admin-accent)]" />
        Ingresos por Día
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--admin-text-muted)" }}
            tickFormatter={(v: string) => {
              const d = new Date(v + "T00:00:00");
              return d.toLocaleDateString("es-AR", {
                weekday: "short",
                day: "numeric",
              });
            }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--admin-text-muted)" }}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelFormatter={(v: unknown) => {
              const dateStr = String(v);
              return new Date(dateStr + "T00:00:00").toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              });
            }}
            formatter={(value: unknown) => [formatCurrency(Number(value)), "Ingresos"]}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--admin-accent)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--admin-accent)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function HourlyChart({ data }: { data: HourlyStats[] }) {
  if (data.length === 0) return null;

  const fullData = Array.from({ length: 24 }, (_, i) => {
    const found = data.find((d) => d.hour === i);
    return {
      hour: `${i.toString().padStart(2, "0")}:00`,
      orders: found?.orders ?? 0,
      revenue: found?.revenue ?? 0,
    };
  });

  return (
    <div className="admin-card p-5">
      <h2 className="text-sm font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <Clock size={16} className="text-[var(--admin-accent)]" />
        Pedidos por Hora
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={fullData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 9, fill: "var(--admin-text-muted)" }}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--admin-text-muted)" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: unknown, name: unknown) => {
              const v = Number(value);
              const n = String(name);
              return [n === "orders" ? v : formatCurrency(v), n === "orders" ? "Pedidos" : "Ingresos"];
            }}
          />
          <Bar dataKey="orders" fill="var(--admin-accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TopProductsCard({ products }: { products: TopProduct[] }) {
  if (products.length === 0) return null;
  const maxCantidad = Math.max(...products.map((p) => p.cantidad));

  return (
    <div className="admin-card p-5 lg:col-span-1">
      <h2 className="text-sm font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <Star size={16} className="text-amber-500" />
        Productos Más Vendidos
      </h2>
      <div className="space-y-3">
        {products.map((p, idx) => (
          <div key={p.nombre_producto} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-black text-[var(--admin-text-muted)] w-4 shrink-0">
                  #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-[var(--admin-text)] truncate">
                  {p.nombre_producto}
                </span>
              </div>
              <span className="text-xs font-bold text-[var(--admin-text)] shrink-0 ml-2">
                {p.cantidad} uds.
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--admin-bg)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                style={{
                  width: `${(p.cantidad / maxCantidad) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerStatsCard({
  stats,
}: {
  stats: CustomerStats;
}) {
  if (stats.totalClientes === 0) return null;

  return (
    <div className="admin-card p-5 lg:col-span-1">
      <h2 className="text-sm font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <Users size={16} className="text-[var(--admin-accent)]" />
        Clientes
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--admin-bg)] rounded-xl p-3">
          <p className="text-[9px] font-black uppercase tracking-wider text-[var(--admin-text-muted)] mb-1">
            Totales
          </p>
          <p className="text-xl font-black text-[var(--admin-text)]">
            {stats.totalClientes}
          </p>
        </div>
        <div className="bg-[var(--admin-bg)] rounded-xl p-3">
          <p className="text-[9px] font-black uppercase tracking-wider text-[var(--admin-text-muted)] mb-1">
            Nuevos
          </p>
          <p className="text-xl font-black text-green-600">{stats.nuevos}</p>
        </div>
        <div className="bg-[var(--admin-bg)] rounded-xl p-3">
          <p className="text-[9px] font-black uppercase tracking-wider text-[var(--admin-text-muted)] mb-1">
            Recurrentes
          </p>
          <p className="text-xl font-black text-blue-600">{stats.recurrentes}</p>
        </div>
        <div className="bg-[var(--admin-bg)] rounded-xl p-3">
          <p className="text-[9px] font-black uppercase tracking-wider text-[var(--admin-text-muted)] mb-1">
            Ticket Prom.
          </p>
          <p className="text-xl font-black text-[var(--admin-text)]">
            {formatCurrency(stats.avgTicket)}
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodsChart({
  methods,
}: {
  methods: PaymentMethodStats[];
}) {
  if (methods.length === 0) return null;
  const totalRevenue = methods.reduce((s, m) => s + m.revenue, 0);

  return (
    <div className="admin-card p-5">
      <h2 className="text-sm font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <Wallet size={16} className="text-[var(--admin-accent)]" />
        Métodos de Pago
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={methods.map((m) => ({
                name: m.method,
                value: m.revenue,
              }))}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              dataKey="value"
              strokeWidth={0}
            >
              {methods.map((_, idx) => (
                <Cell
                  key={idx}
                  fill={PIE_COLORS[idx % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--admin-surface)",
                border: "1px solid var(--admin-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: unknown) => [formatCurrency(Number(value)), "Ingresos"]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2.5 flex flex-col justify-center">
          {methods.map((m, idx) => {
            const pct =
              totalRevenue > 0
                ? ((m.revenue / totalRevenue) * 100).toFixed(1)
                : "0";
            return (
              <div key={m.method} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{
                      backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                    }}
                  />
                  <span className="text-[var(--admin-text-muted)] capitalize">
                    {m.method}
                  </span>
                </span>
                <span className="font-semibold text-[var(--admin-text)]">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CategoryChart({ data }: { data: CategoryStats[] }) {
  if (data.length === 0) return null;
  const maxCantidad = Math.max(...data.map((c) => c.cantidad));

  return (
    <div className="admin-card p-5">
      <h2 className="text-sm font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
        <Package size={16} className="text-[var(--admin-accent)]" />
        Ventas por Categoría
      </h2>
      <div className="space-y-3">
        {data.map((c, idx) => (
          <div key={c.categoria} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--admin-text)] capitalize">
                {c.categoria}
              </span>
              <span className="text-xs font-bold text-[var(--admin-text)]">
                {c.cantidad} uds.
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--admin-bg)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(c.cantidad / maxCantidad) * 100}%`,
                  backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyTable({
  breakdown,
  totalCount,
}: {
  breakdown: DailyStats[];
  totalCount: number;
}) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[var(--admin-text)] flex items-center gap-2">
          <Calendar size={16} className="text-[var(--admin-accent)]" />
          Ventas por Día
        </h2>
        <span className="text-xs font-semibold text-[var(--admin-text-muted)]">
          {totalCount} pedidos
        </span>
      </div>

      {breakdown.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">
                <th className="p-4 pl-6 border-b border-[var(--admin-border)]">
                  Fecha
                </th>
                <th className="p-4 border-b border-[var(--admin-border)]">
                  Pedidos
                </th>
                <th className="p-4 pr-6 text-right border-b border-[var(--admin-border)]">
                  Ingresos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {breakdown.map((row) => (
                <tr
                  key={row.date}
                  className="hover:bg-[var(--admin-accent)]/5 transition-colors"
                >
                  <td className="p-4 pl-6 font-medium text-[var(--admin-text)]">
                    {new Date(row.date + "T00:00:00").toLocaleDateString(
                      "es-AR",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      },
                    )}
                  </td>
                  <td className="p-4 text-[var(--admin-text)]">{row.orders}</td>
                  <td className="p-4 pr-6 text-right font-semibold text-[var(--admin-text)]">
                    {formatCurrency(row.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-[var(--admin-text-muted)]">
          <Package size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
          <p className="text-sm font-medium">Sin datos diarios</p>
        </div>
      )}
    </div>
  );
}
