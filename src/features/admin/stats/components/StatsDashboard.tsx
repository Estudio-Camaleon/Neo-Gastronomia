"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingBag,
  XCircle,
  Download,
  Calendar,
  Package,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { getStats, exportOrdersCSV } from "../actions";
import type { StatsData, StatsSummary } from "../actions";
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

interface StatsDashboardProps {
  negocioId: string;
}

export function StatsDashboard({ negocioId }: StatsDashboardProps) {
  const [period, setPeriod] = useState<Period>("month");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  const handleExport = async () => {
    setExporting(true);
    try {
      const range = getPeriodRange(period);
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

      toast.success("Exportación completada");
    } catch {
      toast.error("Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--admin-text)]">
            Estadísticas
          </h1>
          <p className="text-[var(--admin-text-muted)] text-sm font-medium">
            Control de ventas y rendimiento del negocio.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || !data || data.totalCount === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-accent)] text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          {exporting ? "Exportando..." : "Exportar CSV"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 bg-[var(--admin-bg)] p-1.5 rounded-xl border border-[var(--admin-border)] w-fit">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              period === p
                ? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-xs border border-[var(--admin-border)]"
                : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[var(--admin-text-muted)]">
              Cargando estadísticas...
            </p>
          </div>
        </div>
      )}

      {data && !loading && (
        <>
          <SummaryCards summary={data.summary} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyTable
              breakdown={data.dailyBreakdown}
              totalCount={data.totalCount}
            />
            <PaymentMethodsCard methods={data.paymentMethods} />
          </div>
        </>
      )}

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

function SummaryCards({ summary }: { summary: StatsSummary }) {
  const cards = [
    {
      title: "Ingresos Totales",
      value: `$${summary.totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
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
      value: `$${summary.avgTicket.toFixed(2)}`,
      icon: Wallet,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Cancelados",
      value: String(summary.cancelados),
      subtitle: summary.totalOrders > 0
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

function DailyTable({
  breakdown,
  totalCount,
}: {
  breakdown: StatsData["dailyBreakdown"];
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
                    ${row.revenue.toFixed(2)}
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

function PaymentMethodsCard({
  methods,
}: {
  methods: StatsData["paymentMethods"];
}) {
  const totalRevenue = methods.reduce((s, m) => s + m.revenue, 0);

  return (
    <div className="admin-card p-6">
      <h2 className="text-sm font-bold text-[var(--admin-text)] mb-5 flex items-center gap-2">
        <Wallet size={16} className="text-[var(--admin-accent)]" />
        Métodos de Pago
      </h2>

      {methods.length > 0 ? (
        <div className="space-y-4">
          {methods.map((m) => {
            const pct =
              totalRevenue > 0
                ? ((m.revenue / totalRevenue) * 100).toFixed(1)
                : "0";
            return (
              <div key={m.method}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--admin-text)] capitalize">
                      {m.method}
                    </span>
                    <span className="text-[10px] font-medium text-[var(--admin-text-muted)]">
                      {m.orders} pedidos
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[var(--admin-text)]">
                    ${m.revenue.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--admin-bg)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--admin-accent)] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] font-medium text-[var(--admin-text-muted)] mt-0.5">
                  {pct}% del total
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-[var(--admin-text-muted)]">
          <Wallet size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
          <p className="text-sm font-medium">Sin datos de pago</p>
        </div>
      )}
    </div>
  );
}
