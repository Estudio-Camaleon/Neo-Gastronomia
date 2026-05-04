"use client";

import { Clock, Plus, Trash2 } from "lucide-react";

interface ScheduleEditorProps {
  schedule: any;
  onChange: (newSchedule: any) => void;
}

const DIAS = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

export function ScheduleEditor({ schedule, onChange }: ScheduleEditorProps) {
  const updateDay = (day: string, active: boolean) => {
    const newSchedule = { ...schedule };
    if (!active) {
      delete newSchedule[day];
    } else {
      newSchedule[day] = { inicio: "19:00", fin: "23:59" };
    }
    onChange(newSchedule);
  };

  const updateTime = (day: string, field: "inicio" | "fin", value: string) => {
    onChange({
      ...schedule,
      [day]: { ...schedule[day], [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="text-primary w-5 h-5" />
        <h2 className="font-black uppercase italic tracking-tight text-lg">
          Horarios de Atención
        </h2>
      </div>

      <div className="grid gap-3">
        {DIAS.map((dia) => {
          const isOpen = !!schedule[dia.id];
          return (
            <div
              key={dia.id}
              className={`flex items-center justify-between p-4 rounded-neo border-2 transition-all ${
                isOpen
                  ? "border-primary/30 bg-primary/5"
                  : "border-border opacity-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={(e) => updateDay(dia.id, e.target.checked)}
                  className="w-5 h-5 accent-primary"
                />
                <span className="font-black uppercase italic text-xs w-20">
                  {dia.label}
                </span>
              </div>

              {isOpen && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                  <input
                    type="time"
                    value={schedule[dia.id].inicio}
                    onChange={(e) =>
                      updateTime(dia.id, "inicio", e.target.value)
                    }
                    className="bg-white dark:bg-bg-dark border-2 border-border p-2 rounded-lg text-xs font-bold"
                  />
                  <span className="text-[10px] font-black opacity-30">A</span>
                  <input
                    type="time"
                    value={schedule[dia.id].fin}
                    onChange={(e) => updateTime(dia.id, "fin", e.target.value)}
                    className="bg-white dark:bg-bg-dark border-2 border-border p-2 rounded-lg text-xs font-bold"
                  />
                </div>
              )}

              {!isOpen && (
                <span className="text-[10px] font-black uppercase opacity-40 italic tracking-widest">
                  Cerrado
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
