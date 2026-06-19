"use client";

import { Percent, Tag, ShoppingBag, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";
import type { PromoRow } from "@/core/types/domain";

interface ComboItem {
  nombre_producto: string;
  cantidad: number;
  precio?: number;
}

interface PromoCardProps {
  promo: PromoRow;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function PromoCard({ promo, onToggle, onEdit, onDelete, isDeleting }: PromoCardProps) {
  const isCombo = promo.tipo_descuento === "combo";
  const comboItems = isCombo ? (promo.items_combo as ComboItem[] | null) ?? [] : [];

  const typeConfig = isCombo
    ? { icon: ShoppingBag, color: "blue", bg: "bg-blue-500/10 border-blue-500/20 text-blue-500", badge: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Combo" }
    : promo.tipo_descuento === "porcentaje"
      ? { icon: Percent, color: "purple", bg: "bg-purple-500/10 border-purple-500/20 text-purple-500", badge: "bg-purple-500/10 text-purple-600 border-purple-500/20", label: "% Descuento" }
      : { icon: Tag, color: "amber", bg: "bg-amber-500/10 border-amber-500/20 text-amber-500", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Descuento Fijo" };

  const TypeIcon = typeConfig.icon;

  const comboTotal = comboItems.reduce(
    (s: number, i: ComboItem) => s + (i.precio ?? 0) * i.cantidad,
    0,
  );

  return (
    <div className={`admin-card p-4 relative overflow-hidden transition-all duration-200 flex flex-col ${!promo.activo ? "opacity-60" : ""}`}>
      {/* Header: icon + name + status */}
      <div className="flex items-start gap-2.5 mb-3">
        <div className={`p-2 rounded-lg border shrink-0 ${typeConfig.bg}`}>
          <TypeIcon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-sm text-[var(--admin-text)] truncate">
              {promo.nombre}
            </h3>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${typeConfig.badge}`}>
              {typeConfig.label}
            </span>
            {!promo.activo && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--admin-text-muted)]/10 text-[var(--admin-text-muted)] border border-[var(--admin-border)]">
                Inactiva
              </span>
            )}
          </div>
          {promo.descripcion && (
            <p className="text-[11px] text-[var(--admin-text-muted)] mt-0.5 line-clamp-2">
              {promo.descripcion}
            </p>
          )}
        </div>
        {promo.imagen_url && (
          <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-[var(--admin-border)]">
            <img src={promo.imagen_url} alt={promo.nombre} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-lg font-black ${
          isCombo ? "text-blue-500" : promo.tipo_descuento === "porcentaje" ? "text-purple-500" : "text-amber-500"
        }`}>
          {isCombo
            ? `$${promo.valor_descuento.toLocaleString("es-AR")}`
            : promo.tipo_descuento === "porcentaje"
              ? `${promo.valor_descuento}%`
              : `$${promo.valor_descuento.toLocaleString("es-AR")}`}
        </span>
        {promo.codigo && (
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)]">
            Código: {promo.codigo}
          </span>
        )}
      </div>

      {/* Combo items */}
      {isCombo && comboItems.length > 0 && (
        <div className="mb-3 space-y-1">
          <p className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
            Incluye:
          </p>
          <div className="space-y-0.5">
            {comboItems.slice(0, 4).map((item: ComboItem, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px] text-[var(--admin-text)] bg-[var(--admin-bg)] rounded-md px-2 py-1">
                <span className="font-bold">{item.cantidad}x</span>
                <span className="truncate">{item.nombre_producto}</span>
              </div>
            ))}
            {comboItems.length > 4 && (
              <p className="text-[9px] text-[var(--admin-text-muted)] pl-2">
                +{comboItems.length - 4} más
              </p>
            )}
          </div>
          {comboTotal > 0 && (
            <p className="text-[9px] text-[var(--admin-text-muted)]">
              Valor real: <span className="line-through">${comboTotal.toLocaleString("es-AR")}</span>
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[var(--admin-border)] mt-auto">
        <button
          onClick={onToggle}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
            promo.activo
              ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
              : "bg-[var(--admin-text-muted)]/10 text-[var(--admin-text-muted)] hover:bg-[var(--admin-text-muted)]/20"
          }`}
        >
          {promo.activo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {promo.activo ? "Activa" : "Inactiva"}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-all"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40"
            title="Eliminar"
          >
            {isDeleting ? <FoodMini size={14} /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
