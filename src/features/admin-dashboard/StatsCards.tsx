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

/**
 * Celda atómica de métricas con UI Neo-Brutalista rígida de alta legibilidad.
 */
function StatCard({
  title,
  value,
  icon: Icon,
  accentBg = false,
}: StatCardProps) {
  return (
    <div className="border-4 border-black bg-white p-6 flex items-center justify-between font-sans text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in duration-200">
      <div className="space-y-1">
        <h3 className="text-xs font-mono font-black uppercase text-gray-400 tracking-widest">
          📊 METRIC // {title}
        </h3>
        <p className="text-4xl font-mono font-black italic tracking-tighter leading-none">
          {value}
        </p>
      </div>

      {/* Contenedor del Icono Vectorial con Sombra Plana */}
      <div
        className={`w-12 h-12 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] shrink-0
          ${accentBg ? "bg-[#A3FF00] text-black" : "bg-black text-white"}`}
      >
        <Icon className="h-5 w-5 stroke-[2.5]" />
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
function PushNotificationIconHack(icon: any) {
  return icon as React.ComponentType<{ className?: string }>;
}
