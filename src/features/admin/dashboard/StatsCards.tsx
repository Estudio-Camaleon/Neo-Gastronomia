"use client";

import React from "react";
import { Package, CheckSquare, ShoppingBag } from "lucide-react";

const formatNumber = (num: number) =>
  new Intl.NumberFormat("es-AR").format(num);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accentBg?: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  accentBg = false,
}: StatCardProps) {
  return (
    <div className="admin-card p-5 md:p-6 flex items-center justify-between animate-in fade-in duration-200">
      <div className="space-y-1.5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">
          {title}
        </h3>
        <p className="text-3xl md:text-4xl font-black tracking-tight leading-none text-[var(--admin-text)]">
          {value}
        </p>
      </div>

      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
          accentBg
            ? "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]"
            : "bg-[var(--admin-surface-strong, rgba(255,255,255,0.9))] text-[var(--admin-text-muted)] border border-[var(--admin-border)]"
        }`}
      >
        <Icon className="h-5 w-5 stroke-[2]" />
      </div>
    </div>
  );
}

interface StatsCardsProps {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
}

export function StatsCards({
  totalProducts,
  activeProducts,
  totalOrders,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
      <StatCard
        title="Total Productos"
        value={formatNumber(totalProducts)}
        icon={Package}
      />
      <StatCard
        title="Productos Activos"
        value={formatNumber(activeProducts)}
        icon={CheckSquare}
      />
      <StatCard
        title="Pedidos Recibidos"
        value={formatNumber(totalOrders)}
        icon={PushNotificationIconHack(ShoppingBag)}
        accentBg
      />
    </div>
  );
}

// Helper puramente sintáctico para tipar componentes de Lucide sin leaks en el linter
function PushNotificationIconHack(
  icon: React.ComponentType<{ className?: string }>,
) {
  return icon;
}
