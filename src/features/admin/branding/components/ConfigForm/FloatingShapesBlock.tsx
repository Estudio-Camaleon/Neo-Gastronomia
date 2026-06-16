"use client";

import { ImageIcon, MoveHorizontal, Eye } from "lucide-react";
import { FOOD_SHAPES } from "../../types";

export interface FloatingShapesBlockProps {
  selected: string[];
  onChange: (shapes: string[]) => void;
  density: "low" | "medium" | "high";
  onDensityChange: (density: "low" | "medium" | "high") => void;
  colorPrimary: string;
}

export function FloatingShapesBlock({
  selected,
  onChange,
  density,
  onDensityChange,
  colorPrimary,
}: FloatingShapesBlockProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const categories = [
    { key: "comida", label: "🍕 Comida" },
    { key: "bebida", label: "🥤 Bebidas" },
    { key: "abstracto", label: "✨ Abstracto" },
  ] as const;

  const DENSITY_OPTIONS = [
    { value: "low" as const, label: "Sutil", desc: "Pocas formas, espaciadas" },
    { value: "medium" as const, label: "Normal", desc: "Dosis equilibrada" },
    { value: "high" as const, label: "Intenso", desc: "Muchas formas, ambiente denso" },
  ];

  const previewShapes = selected.length > 0 ? selected : ["Pizza", "Coffee", "Star"];

  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm space-y-5">
      {/* HEADER */}
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
        <ImageIcon size={14} className="text-[var(--admin-text-muted)]" />
        <h2 className="text-xs font-semibold text-[var(--admin-text)] flex items-center gap-1">
          Formas Flotantes del Menú Público
          <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">Opcional</span>
        </h2>
      </div>

      {/* EXPLICACIÓN VISUAL */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)]">
        <Eye size={16} className="text-[var(--admin-accent)] shrink-0 mt-0.5" />
        <div className="text-[10px] text-[var(--admin-text-muted)] leading-relaxed space-y-1">
          <p>
            <strong className="text-[var(--admin-text)]">¿Cómo funciona?</strong> Las formas seleccionadas aparecen flotando <strong>detrás</strong> del contenido del menú público — como decoración de fondo. Se colocan automáticamente en los bordes y esquinas, sin tapar el logo, los productos ni los tickets.
          </p>
          <p>
            Cada forma seleccionada se repite varias veces con distintos tamaños, rotaciones y velocidades de animación para crear un ambiente visual dinámico.
          </p>
        </div>
      </div>

      {/* PREVIEW EN VIVO */}
      <div className="space-y-2">
        <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
          <MoveHorizontal size={12} />
          Vista previa en vivo
        </span>
        <div
          className="relative w-full h-28 rounded-lg border border-[var(--admin-border)] overflow-hidden bg-[var(--admin-bg)]"
          style={{ backgroundColor: colorPrimary + "08" }}
        >
          {/* Mini shapes preview */}
          {previewShapes.map((key, i) => {
            const shape = FOOD_SHAPES.find((s) => s.value === key);
            if (!shape) return null;
            const densityCount =
              density === "low" ? 2 : density === "medium" ? 4 : 6;
            const instances = Math.min(densityCount, 4);
            return Array.from({ length: instances }).map((_, j) => {
              const angle = ((i * 60 + j * 90) * Math.PI) / 180;
              const radius = 25 + ((i * 7 + j * 13) % 25);
              const top = 50 + Math.sin(angle) * radius;
              const left = 50 + Math.cos(angle) * radius;
              const size = 12 + ((i * 3 + j * 5) % 16);
              const opacity = 0.08 + ((i * 2 + j * 3) % 8) * 0.015;
              return (
                <div
                  key={`${key}_${j}`}
                  className="absolute pointer-events-none transition-all duration-1000"
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    width: size,
                    height: size,
                    opacity,
                    transform: `translate(-50%, -50%) rotate(${i * 30 + j * 45}deg)`,
                  }}
                >
                  <shape.Icon size={size} strokeWidth={1.2} />
                </div>
              );
            });
          })}
          {/* Preview center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/40 bg-[var(--admin-surface)]/60 px-2 py-1 rounded-full backdrop-blur-sm">
              {selected.length > 0
                ? `${selected.length} forma${selected.length !== 1 ? "s" : ""} activa${selected.length !== 1 ? "s" : ""}`
                : "Vista con formas por defecto"}
            </span>
          </div>
        </div>
      </div>

      {/* DENSIDAD */}
      <div className="space-y-2.5">
        <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider block">
          Densidad de aparición
        </span>
        <div className="flex gap-2">
          {DENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onDensityChange(opt.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-medium transition-all border text-left ${
                density === opt.value
                  ? "bg-[var(--admin-accent)] text-white border-[var(--admin-accent)] shadow-sm"
                  : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] border-[var(--admin-border)] hover:border-[var(--admin-accent)]/30"
              }`}
            >
              <span className="block text-[11px] font-semibold">{opt.label}</span>
              <span className="block opacity-70 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SELECCIÓN DE FORMAS */}
      <div className="space-y-3">
        <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon size={12} />
          Formas disponibles
          <span className="text-[10px] font-normal text-[var(--admin-text-muted)]/50 normal-case tracking-normal">
            (hacé clic para activar)
          </span>
        </span>

        {categories.map((cat) => {
          const catShapes = FOOD_SHAPES.filter((s) => s.category === cat.key);
          const catActiveCount = catShapes.filter((s) =>
            selected.includes(s.value),
          ).length;
          return (
            <div key={cat.key} className="space-y-1.5">
              <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/70 block">
                {cat.label}
                {catActiveCount > 0 && (
                  <span className="ml-1.5 text-[var(--admin-accent)] font-semibold">
                    ({catActiveCount})
                  </span>
                )}
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
                {catShapes.map(({ value, label, Icon }) => {
                  const isActive = selected.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggle(value)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[9px] font-medium transition-all border ${
                        isActive
                          ? "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border-[var(--admin-accent)]/30 shadow-sm"
                          : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)]/60 border-[var(--admin-border)] hover:border-[var(--admin-accent)]/20 hover:text-[var(--admin-text)]"
                      }`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2 : 1.2} />
                      <span className="whitespace-nowrap">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* RESUMEN DE ACTIVAS */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--admin-border)]">
        <span className="text-[9px] text-[var(--admin-text-muted)]">
          {selected.length === 0
            ? "Ninguna forma seleccionada — se usarán las predeterminadas"
            : `${selected.length} forma${selected.length !== 1 ? "s" : ""} activa${selected.length !== 1 ? "s" : ""} · densidad ${density === "low" ? "sutil" : density === "medium" ? "normal" : "intensa"}`}
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[9px] text-[var(--admin-text-muted)]/50 hover:text-red-400 transition-colors underline"
          >
            Limpiar selección
          </button>
        )}
      </div>
    </div>
  );
}
