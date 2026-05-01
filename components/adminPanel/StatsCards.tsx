import React from "react";

const formatNumber = (num: number) =>
  new Intl.NumberFormat("es-AR").format(num);

// Componente pequeño para cada tarjeta individual
function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-surface dark:bg-surface-dark p-6 rounded-2xl border border-border dark:border-border-dark shadow-sm hover:border-primary transition-colors">
      <h3 className="text-sm font-medium text-text-secondary mb-2">{title}</h3>
      <p className="text-3xl font-bold text-text-primary dark:text-text-inverse">
        {value}
      </p>
    </div>
  );
}

export function StatsCards({
  totalProducts,
  activeProducts,
  totalOrders,
}: {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard title="Total Productos" value={formatNumber(totalProducts)} />
      <StatCard
        title="Productos Activos"
        value={formatNumber(activeProducts)}
      />
      <StatCard title="Pedidos Recibidos" value={formatNumber(totalOrders)} />
    </div>
  );
}
