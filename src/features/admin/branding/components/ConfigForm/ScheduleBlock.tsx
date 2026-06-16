"use client";

import { Trash2, Plus, Copy } from "lucide-react";
import { toast } from "sonner";
import { DIAS } from "../../types";
import type { FranjaHoraria, ScheduleData } from "../../types";

export interface ScheduleBlockProps {
  schedule: ScheduleData;
  onChange: (s: ScheduleData) => void;
}

export function ScheduleBlock({
  schedule = {},
  onChange,
}: ScheduleBlockProps) {
  const getTurnos = (dayId: string) => schedule[dayId]?.turnos || [];

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
    <div className="border border-[var(--admin-border)] rounded-lg overflow-hidden text-xs">
      <div className="divide-y divide-[var(--admin-border)]">
        {DIAS.map((dia) => {
          const turnos = getTurnos(dia.id);
          const isOpen = turnos.length > 0;

          return (
            <div
              key={dia.id}
              className={`flex flex-col md:flex-row md:items-center transition-colors ${
                isOpen ? "bg-[var(--admin-surface)]" : "bg-[var(--admin-bg)]/50"
              }`}
            >
              <div className="w-full md:w-36 px-4 py-2.5 flex items-center justify-between md:justify-start gap-4 border-b md:border-b-0 md:border-r border-[var(--admin-border)] shrink-0">
                <span
                  className={`font-medium ${
                    isOpen
                      ? "text-[var(--admin-text)]"
                      : "text-[var(--admin-text-muted)] opacity-70"
                  }`}
                >
                  {dia.label}
                </span>
                <button
                  type="button"
                  onClick={() => updateDay(dia.id, !isOpen)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 outline-none ${
                    isOpen
                      ? "bg-[var(--admin-accent)]"
                      : "bg-[var(--admin-text-muted)]/30"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-150 ${
                      isOpen ? "translate-x-3" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex-1 px-4 py-1.5 flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 min-h-[44px]">
                {isOpen ? (
                  <div className="flex flex-wrap gap-2">
                    {turnos.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-md p-1 animate-in zoom-in-95 duration-100"
                      >
                        <input
                          type="time"
                          value={t.inicio}
                          onChange={(e) =>
                            updateTime(dia.id, idx, "inicio", e.target.value)
                          }
                          className="bg-transparent text-xs font-medium outline-none text-[var(--admin-text)] p-0.5 cursor-pointer"
                        />
                        <span className="text-[9px] font-bold text-[var(--admin-text-muted)]">
                          A
                        </span>
                        <input
                          type="time"
                          value={t.fin}
                          onChange={(e) =>
                            updateTime(dia.id, idx, "fin", e.target.value)
                          }
                          className="bg-transparent text-xs font-medium outline-none text-[var(--admin-text)] p-0.5 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => removeFranja(dia.id, idx)}
                          className="text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 p-1 rounded-md transition-colors"
                          title="Remover franja"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] font-normal text-[var(--admin-text-muted)] opacity-70 italic">
                    Cerrado (Sin operaciones)
                  </span>
                )}
              </div>

              <div className="px-4 py-1.5 flex items-center justify-end gap-1.5 shrink-0 md:w-[150px] border-t md:border-t-0 md:border-l border-[var(--admin-border)]">
                {isOpen && (
                  <>
                    {turnos.length < 2 && (
                      <button
                        type="button"
                        onClick={() => addFranja(dia.id)}
                        className="p-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] rounded-md transition-colors flex items-center gap-0.5 font-medium text-[10px]"
                      >
                        <Plus size={11} /> Turno
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => cloneToAll(dia.id)}
                      className="p-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] rounded-md transition-colors flex items-center gap-1 font-medium text-[10px]"
                      title="Propagar este esquema semanalmente"
                    >
                      <Copy size={10} /> Semanal
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
