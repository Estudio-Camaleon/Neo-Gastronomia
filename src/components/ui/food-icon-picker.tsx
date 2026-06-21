"use client";

import { useState, useRef, useEffect } from "react";
import { FOOD_ICONS, type FoodIconKey } from "./food-icons";

interface FoodIconPickerProps {
  value: string;
  onChange: (icono: string) => void;
}

export function FoodIconPicker({ value, onChange }: FoodIconPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const entries = Object.entries(FOOD_ICONS) as [
    FoodIconKey,
    (typeof FOOD_ICONS)[FoodIconKey],
  ][];

  const selected = value && value in FOOD_ICONS ? FOOD_ICONS[value as FoodIconKey] : null;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center size-9 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] hover:border-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/5 transition-all cursor-pointer"
        title="Seleccionar ícono"
      >
        {selected ? (
          <img
            src={selected.path}
            alt={selected.label}
            className="size-5 object-contain pointer-events-none dark:invert"
          />
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--admin-text-muted)]"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
          </svg>
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-64 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-lg p-3">
          <p className="text-[10px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-2 px-1">
            Elegí un ícono
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {entries.map(([key, icon]) => {
              const isSelected = value === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/10"
                      : "border-transparent hover:border-[var(--admin-border)] hover:bg-[var(--admin-bg)]"
                  }`}
                  title={icon.label}
                >
                  <img
                    src={icon.path}
                    alt={icon.label}
                    className="size-7 object-contain pointer-events-none dark:invert"
                  />
                  <span className="text-[8px] font-medium text-[var(--admin-text-muted)] leading-tight text-center line-clamp-1">
                    {icon.label}
                  </span>
                </button>
              );
            })}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mt-2 w-full text-center text-[10px] font-medium text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] py-1.5 rounded-md hover:bg-[var(--admin-bg)] transition-colors cursor-pointer"
            >
              Quitar ícono
            </button>
          )}
        </div>
      )}
    </div>
  );
}
