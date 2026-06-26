"use client";

import { useCallback, useState } from "react";
import { Trash2, Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { DIAS } from "../../../types";
import type { FranjaHoraria, ScheduleData } from "../../../types";

export interface ScheduleBlockProps {
  schedule: ScheduleData;
  onChange: (s: ScheduleData) => void;
}

export function ScheduleBlock({
  schedule = {},
  onChange,
}: ScheduleBlockProps) {
  const getTurnos = useCallback(
    (dayId: string) => schedule[dayId]?.turnos || [],
    [schedule],
  );

  const updateDay = (day: string, active: boolean) => {
    const updated = { ...schedule };
    if (active) updated[day] = { turnos: [{ inicio: "12:00", fin: "16:00" }] };
    else delete updated[day];
    onChange(updated);
  };

  const addFranja = (day: string) => {
    const turnos = getTurnos(day);
    if (turnos.length >= 2) {
      return toast.error("Capacidad operacional máxima: 2 turnos por jornada.");
    }
    const updated = {
      ...schedule,
      [day]: { turnos: [...turnos, { inicio: "20:00", fin: "00:00" }] },
    };
    onChange(updated);
  };

  const removeFranja = (day: string, index: number) => {
    const turnos = getTurnos(day).filter((_, i) => i !== index);
    const updated = { ...schedule };
    if (turnos.length === 0) delete updated[day];
    else updated[day] = { turnos };
    onChange(updated);
  };

  const updateTime = (
    day: string,
    index: number,
    field: keyof FranjaHoraria,
    value: string,
  ) => {
    const turnos = [...getTurnos(day)];
    turnos[index] = { ...turnos[index], [field]: value };
    onChange({ ...schedule, [day]: { turnos } });
  };

  const cloneToAll = (dayId: string) => {
    const source = getTurnos(dayId);
    if (!source.length) {
      return toast.error("Debe existir una celda origen para replicar.");
    }
    const newSchedule: ScheduleData = {};
    DIAS.forEach((d) => {
      newSchedule[d.id] = { turnos: source.map((t) => ({ ...t })) };
    });
    onChange(newSchedule);
    toast.success("Esquema propagado a la matriz semanal.");
  };

  return (
    <div className="border border-[var(--admin-border)] rounded-lg text-[15px] overflow-hidden">
      <div className="divide-y divide-[var(--admin-border)]">
        {DIAS.map((dia) => {
          const turnos = getTurnos(dia.id);
          const isOpen = turnos.length > 0;

          return (
            <div
              key={dia.id}
              className={`flex flex-col md:flex-row md:items-stretch transition-colors ${
                isOpen
                  ? "bg-[var(--admin-surface)]"
                  : "bg-[var(--admin-bg)]/50"
              }`}
            >
              {/* ── DAY HEADER ── */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 md:w-40 md:flex-col md:items-start md:justify-center md:gap-1.5 md:border-r md:border-[var(--admin-border)] shrink-0">
                <span
                  className={`font-semibold text-[15px] leading-tight ${
                    isOpen
                      ? "text-[var(--admin-text)]"
                      : "text-[var(--admin-text-muted)]"
                  }`}
                >
                  {dia.label}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOpen}
                  aria-label={`${dia.label} ${isOpen ? "abierto" : "cerrado"}`}
                  onClick={() => updateDay(dia.id, !isOpen)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-surface)] ${
                    isOpen
                      ? "bg-[var(--admin-accent)]"
                      : "bg-[var(--admin-text-muted)]/20 dark:bg-[var(--admin-text-muted)]/15"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-150 ${
                      isOpen ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* ── TIME SLOTS ── */}
              <div className="flex-1 px-4 py-2.5 flex flex-col gap-2 min-h-[52px]">
                {isOpen ? (
                  <div className="flex flex-col gap-2">
                    {turnos.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-2 animate-in zoom-in-95 duration-100"
                      >
                        <input
                          type="time"
                          value={t.inicio}
                          onChange={(e) =>
                            updateTime(dia.id, idx, "inicio", e.target.value)
                          }
                          className="flex-1 min-w-0 bg-transparent text-[14px] sm:text-[15px] font-medium text-[var(--admin-text)] p-1.5 cursor-pointer rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] transition-all"
                        />
                        <span className="text-[11px] font-semibold text-[var(--admin-text-muted)]/50 shrink-0 px-0.5 select-none">
                          A
                        </span>
                        <input
                          type="time"
                          value={t.fin}
                          onChange={(e) =>
                            updateTime(dia.id, idx, "fin", e.target.value)
                          }
                          className="flex-1 min-w-0 bg-transparent text-[14px] sm:text-[15px] font-medium text-[var(--admin-text)] p-1.5 cursor-pointer rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => removeFranja(dia.id, idx)}
                          className="text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors shrink-0"
                          title="Eliminar franja"
                          aria-label="Eliminar franja horaria"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[13px] text-[var(--admin-text-muted)] italic leading-relaxed">
                    Cerrado
                  </span>
                )}
              </div>

              {/* ── ACTIONS ── */}
              <ScheduleActions
                isOpen={isOpen}
                turnosCount={turnos.length}
                onAdd={() => addFranja(dia.id)}
                onClone={() => cloneToAll(dia.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleActions({
  isOpen,
  turnosCount,
  onAdd,
  onClone,
}: {
  isOpen: boolean;
  turnosCount: number;
  onAdd: () => void;
  onClone: () => void;
}) {
  const [justCloned, setJustCloned] = useState(false);

  const handleClone = () => {
    onClone();
    setJustCloned(true);
    setTimeout(() => setJustCloned(false), 1500);
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2.5 md:px-3 md:w-auto border-t md:border-t-0 md:border-l border-[var(--admin-border)]">
      {isOpen && (
        <>
          {turnosCount < 2 && (
            <button
              type="button"
              onClick={onAdd}
              className="p-1.5 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] rounded-lg transition-colors flex items-center gap-1 font-medium text-[12px] sm:text-[13px]"
              title="Agregar turno"
              aria-label="Agregar turno"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Turno</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleClone}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium text-[12px] sm:text-[13px] ${
              justCloned
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)]"
            }`}
            title="Copiar horario a todos los días"
            aria-label="Copiar horario a todos los días"
          >
            {justCloned ? (
              <Check size={13} />
            ) : (
              <Copy size={13} />
            )}
            <span className="hidden sm:inline">
              {justCloned ? "Copiado" : "Semanal"}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
