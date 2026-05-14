"use client";

import React from "react";
import { Plus, Trash2, Copy, ShieldCheck} from "lucide-react";
import { toast } from "sonner";

export interface FranjaHoraria { inicio: string; fin: string; }
export interface HorarioDia { turnos?: FranjaHoraria[]; }
export interface ScheduleData { [dayId: string]: HorarioDia | undefined; }

const DIAS = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

export function ScheduleEditor({
  schedule = {},
  onChange,
}: {
  schedule: ScheduleData;
  onChange: (s: ScheduleData) => void;
}) {
  const getTurnos = (dayId: string) => schedule[dayId]?.turnos || [];

  const updateDay = (day: string, active: boolean) => {
    const updated = { ...schedule };
    if (active) updated[day] = { turnos: [{ inicio: "09:00", fin: "13:00" }] };
    else delete updated[day];
    onChange(updated);
  };

  const addFranja = (day: string) => {
    const turnos = getTurnos(day);
    if (turnos.length >= 2) return toast.error("LIMITE DE TURNOS ALCANZADO");
    const updated = { ...schedule, [day]: { turnos: [...turnos, { inicio: "19:00", fin: "23:00" }] } };
    onChange(updated);
  };

  const removeFranja = (day: string, index: number) => {
    const turnos = getTurnos(day).filter((_, i) => i !== index);
    const updated = { ...schedule };
    if (turnos.length === 0) delete updated[day];
    else updated[day] = { turnos };
    onChange(updated);
  };

  const updateTime = (day: string, index: number, field: keyof FranjaHoraria, value: string) => {
    const turnos = [...getTurnos(day)];
    turnos[index] = { ...turnos[index], [field]: value };
    onChange({ ...schedule, [day]: { turnos } });
  };

  const cloneToAll = (dayId: string) => {
    const source = getTurnos(dayId);
    if (!source.length) return;
    const newSchedule: ScheduleData = {};
    DIAS.forEach((d) => { newSchedule[d.id] = { turnos: source.map((t) => ({ ...t })) }; });
    onChange(newSchedule);
    toast.success("SISTEMA SINCRONIZADO", {
      style: { background: 'var(--admin-bg)', color: 'var(--admin-accent)', border: '2px solid var(--admin-accent)' }
    });
  };

  return (
    <div className="bg-[var(--admin-bg)] border-2 border-[var(--admin-border)] shadow-[var(--admin-shadow)] overflow-hidden transition-all duration-500">
      {/* HEADER DE CONSOLA */}
      <div className="bg-[var(--admin-surface)] px-6 py-4 border-b-2 border-[var(--admin-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[var(--admin-accent)] rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--admin-text)]">
            Disponibilidad Operativa / <span className="opacity-50 font-medium">Protocolo de Apertura</span>
          </span>
        </div>
        <ShieldCheck size={14} className="text-[var(--admin-accent)] opacity-50" />
      </div>

      {/* FILAS DE CONFIGURACIÓN */}
      <div className="divide-y divide-[var(--admin-border)]/10">
        {DIAS.map((dia) => {
          const turnos = getTurnos(dia.id);
          const isOpen = turnos.length > 0;

          return (
            <div 
              key={dia.id} 
              className={`flex flex-col md:flex-row items-stretch md:items-center transition-all duration-300 ${isOpen ? 'bg-[var(--admin-surface)]/20' : 'bg-transparent'}`}
            >
              {/* SELECTOR DE ESTADO */}
              <div className="w-full md:w-44 px-6 py-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-[var(--admin-border)]/5">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={(e) => updateDay(dia.id, e.target.checked)}
                  className="w-4 h-4 rounded-none border-2 border-[var(--admin-border)] accent-[var(--admin-accent)] cursor-pointer"
                />
                <span className={`text-xs font-black uppercase tracking-widest ${isOpen ? 'text-[var(--admin-text)]' : 'text-[var(--admin-text-muted)] opacity-30'}`}>
                  {dia.label}
                </span>
              </div>

              {/* SLOTS DE TIEMPO (PIPELINE) */}
              <div className="flex-1 px-8 py-4 flex items-center min-h-[64px]">
                {isOpen ? (
                  <div className="flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-left-2">
                    {turnos.map((t, idx) => (
                      <div key={idx} className="flex items-center group/slot">
                        <div className="flex items-center bg-[var(--admin-bg)] border border-[var(--admin-border)] px-3 py-1.5 shadow-[2px_2px_0px_0px_var(--admin-border)] focus-within:shadow-[var(--admin-accent)] transition-all">
                          <input 
                            type="time" 
                            value={t.inicio} 
                            onChange={(e) => updateTime(dia.id, idx, "inicio", e.target.value)}
                            className="bg-transparent font-mono text-[11px] font-black outline-none text-[var(--admin-text)] focus:text-[var(--admin-accent)]" 
                          />
                          <span className="mx-2 text-[10px] font-black opacity-20 text-[var(--admin-accent)]"></span>
                          <input 
                            type="time" 
                            value={t.fin} 
                            onChange={(e) => updateTime(dia.id, idx, "fin", e.target.value)}
                            className="bg-transparent font-mono text-[11px] font-black outline-none text-[var(--admin-text)] focus:text-[var(--admin-accent)]" 
                          />
                        </div>
                        <button 
                          onClick={() => removeFranja(dia.id, idx)}
                          className="ml-3 p-1.5 text-[var(--admin-text-muted)] hover:text-rose-500 opacity-0 group-hover/slot:opacity-100 transition-all hover:scale-110"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-[0.5em] opacity-10 italic">
                    Station Offline
                  </span>
                )}
              </div>

              {/* ACCIONES TÉCNICAS */}
              <div className="px-6 py-4 flex items-center justify-end gap-2 border-t md:border-t-0 border-[var(--admin-border)]/5">
                {isOpen && (
                  <>
                    {turnos.length < 2 && (
                      <button
                        onClick={() => addFranja(dia.id)}
                        className="p-2 border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-accent)] hover:text-white transition-all shadow-[2px_2px_0px_0px_var(--admin-border)] active:translate-y-0.5 active:shadow-none"
                        title="Añadir Turno"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    )}
                    <button
                      onClick={() => cloneToAll(dia.id)}
                      className="p-2 border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface-accent)] transition-all shadow-[2px_2px_0px_0px_var(--admin-border)] active:translate-y-0.5 active:shadow-none"
                      title="Sincronizar Semana"
                    >
                      <Copy size={12} />
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