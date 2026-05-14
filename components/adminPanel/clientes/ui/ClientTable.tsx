"use client";

import { User, TrendingUp, ShoppingBag, Trophy } from "lucide-react";
import { Button, Badge } from "../../ui";

// 1. Interfaz corregida para coincidir con el flujo de ClientRadar
interface ClienteResumen {
  nombre: string;
  totalGasto: number;
  pedidos: number;
}

export function ClientTable({ clientes }: { clientes: ClienteResumen[] }) {
  return (
    <div className="w-full">
      {/* VISTA DESKTOP */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-50/50 dark:bg-white/5">
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                Posición / Cliente
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">
                Inversión Total
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">
                Frecuencia
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">
                Insight
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black/5 dark:divide-white/5">
            {clientes.map((cliente, index) => (
              <tr
                key={cliente.nombre + index}
                className="hover:bg-primary/5 transition-colors group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Ranking visual */}
                    <span className="text-xs font-mono font-bold text-text-muted w-4">
                      {index + 1}.
                    </span>
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-[var(--admin-accent)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <User size={18} />
                    </div>
                    <span className="font-black uppercase italic text-sm tracking-tighter">
                      {cliente.nombre}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className="font-mono font-black text-lg text-[var(--admin-accent)]">
                    ${cliente.totalGasto.toLocaleString("es-AR")}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <Badge variant={cliente.pedidos > 5 ? "success" : "neutral"}>
                    {cliente.pedidos} Pedidos
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  {/* Botón de acción rápido basado en el core */}
                  <Button
                    variant="secondary"
                    className="p-2"
                    title="Ver detalles de compra"
                  >
                    <TrendingUp size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VISTA MÓVIL: Cards Neo-Brutales */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {clientes.map((cliente, index) => (
          <div
            key={cliente.nombre + index}
            className="p-5 border-2 border-black bg-[var(--admin-surface)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--admin-accent)] text-white flex items-center justify-center border-2 border-black">
                  {index === 0 ? (
                    <Trophy size={18} className="text-yellow-400" />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div>
                  <p className="font-black uppercase text-[10px] text-text-muted leading-none mb-1">
                    Comunidad NEO
                  </p>
                  <p className="font-black text-lg uppercase italic leading-tight tracking-tighter">
                    {cliente.nombre}
                  </p>
                </div>
              </div>
              <Badge variant={index === 0 ? "success" : "neutral"}>
                TOP {index + 1}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-black/5 dark:bg-white/5 p-3 border border-black/10">
              <div>
                <p className="text-[9px] font-black uppercase text-text-muted">
                  Gasto Total
                </p>
                <p className="font-mono font-bold text-xl">
                  ${cliente.totalGasto.toLocaleString("es-AR")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase text-text-muted">
                  Frecuencia
                </p>
                <p className="font-black text-xl italic">
                  {cliente.pedidos} Peds
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full text-xs"
              icon={ShoppingBag}
            >
              Historial de Pedidos
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
