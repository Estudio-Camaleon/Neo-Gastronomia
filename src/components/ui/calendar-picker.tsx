"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPickerProps {
  value: string | null | undefined; // ISO string
  onChange: (iso: string | null) => void;
  minDate?: Date;
  error?: string;
  placeholder?: string;
}

const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  return grid;
}

export function CalendarPicker({
  value,
  onChange,
  minDate,
  error,
  placeholder = "Seleccionar fecha",
}: CalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value) : null;

  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? new Date().getMonth());

  const days = getMonthDays(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const handleSelect = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    // Preservar hora si había una selección previa
    if (selected) {
      date.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    } else {
      date.setHours(12, 0, 0, 0);
    }
    onChange(date.toISOString());
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  const isDisabled = (day: number) => {
    if (!minDate) return false;
    const date = new Date(viewYear, viewMonth, day);
    return date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
  };

  const today = new Date();
  const isCurrentMonth = today.getMonth() === viewMonth && today.getFullYear() === viewYear;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 p-2 bg-[var(--admin-surface)] border rounded-lg text-xs text-left transition-all ${
          error
            ? "border-red-400"
            : "border-[var(--admin-border)] focus-within:border-[var(--admin-accent)] focus-within:ring-1 focus-within:ring-[var(--admin-accent)]"
        } ${selected ? "text-[var(--admin-text)]" : "text-[var(--admin-text-muted)]"}`}
      >
        <CalendarIcon className="shrink-0 text-[var(--admin-text-muted)]" size={14} />
        <span className="flex-1 truncate">
          {selected
            ? selected.toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : placeholder}
        </span>
        {value && (
          <span
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            className="text-[var(--admin-text-muted)] hover:text-red-500 text-[11px] font-bold px-1"
          >
            ✕
          </span>
        )}
      </button>

      {/* Calendar dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed sm:absolute z-50 left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 top-1/3 sm:top-auto sm:mt-1 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-2xl p-3 w-[calc(100vw-40px)] max-w-[360px] sm:w-72 animate-in zoom-in-95 duration-100">
            {/* Month/Year header */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded-md hover:bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-bold text-[var(--admin-text)]">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded-md hover:bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((day, idx) => {
                if (day === null) return <div key={`e-${idx}`} />;
                const disabled = isDisabled(day);
                const isSelected =
                  selected &&
                  selected.getDate() === day &&
                  selected.getMonth() === viewMonth &&
                  selected.getFullYear() === viewYear;
                const isToday = day === today.getDate() && isCurrentMonth;

                return (
                  <button
                    key={`d-${day}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelect(day)}
                    className={`text-center text-xs py-1.5 rounded-lg transition-all ${
                      isSelected
                        ? "bg-[var(--admin-accent)] text-white font-bold"
                        : isToday
                          ? "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] font-semibold"
                          : "text-[var(--admin-text)] hover:bg-[var(--admin-bg)]"
                    } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--admin-border)]">
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] font-medium text-[var(--admin-text-muted)] hover:text-red-500 transition-colors"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[10px] font-semibold text-[var(--admin-accent)] hover:underline transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CalendarIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? 16}
      height={size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
