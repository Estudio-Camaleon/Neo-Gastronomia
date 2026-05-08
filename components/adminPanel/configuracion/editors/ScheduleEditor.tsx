"use client";

import React from "react";
import { Clock, Plus, Trash2 } from "lucide-react";

// Estructura atómica para soportar múltiples turnos por día
interface FranjaHoraria {
  inicio: string;
  fin: string;
}

interface HorarioDia {
  turnos: FranjaHoraria[];
}

// Interfaz auxiliar de seguridad para leer registros viejos sin romper tipos
interface HorarioViejo {
  inicio?: string;
  fin?: string;
  turnos?: never;
}

interface ScheduleData {
  [dayId: string]: HorarioDia | HorarioViejo | undefined;
}

interface ScheduleEditorProps {
  schedule: ScheduleData;
  // Cambiamos 'newSchedule' por '_newSchedule' para silenciar el error del linter
  onChange: (_newSchedule: ScheduleData) => void;
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
  // Activa o desactiva el día completo
  const updateDay = (day: string, active: boolean) => {
    const updatedSchedule = { ...schedule };
    if (!active) {
      delete updatedSchedule[day];
    } else {
      // Inicializa con un turno por defecto
      updatedSchedule[day] = {
        turnos: [{ inicio: "09:00", fin: "13:00" }],
      };
    }
    onChange(updatedSchedule);
  };

  // Modifica de forma segura la hora de un turno específico mediante su índice
  const updateTurnoTime = (
    day: string,
    index: number,
    field: "inicio" | "fin",
    value: string,
  ) => {
    const dayData = schedule[day];
    if (!dayData || !("turnos" in dayData) || !dayData.turnos) return;

    const nuevosTurnos = [...dayData.turnos];
    nuevosTurnos[index] = { ...nuevosTurnos[index], [field]: value };

    onChange({
      ...schedule,
      [day]: { ...dayData, turnos: nuevosTurnos },
    });
  };

  // Agrega un segundo turno (Turno cortado)
  const addTurno = (day: string) => {
    const dayData = schedule[day];
    if (!dayData || !("turnos" in dayData) || !dayData.turnos) return;

    // Limitamos a un máximo de 2 turnos para mantener limpia la UI y la DB
    if (dayData.turnos.length >= 2) return;

    onChange({
      ...schedule,
      [day]: {
        ...dayData,
        turnos: [...dayData.turnos, { inicio: "19:00", fin: "23:00" }],
      },
    });
  };

  // Remueve el segundo turno volviendo al horario de corrido
  const removeTurno = (day: string, index: number) => {
    const dayData = schedule[day];
    if (!dayData || !("turnos" in dayData) || !dayData.turnos) return;

    const nuevosTurnos = dayData.turnos.filter((_, i) => i !== index);

    // Si borra todos los turnos, marcamos el día como cerrado
    if (nuevosTurnos.length === 0) {
      updateDay(day, false);
      return;
    }

    onChange({
      ...schedule,
      [day]: { ...dayData, turnos: nuevosTurnos },
    });
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="text-primary w-5 h-5" />
        <h2 className="font-black uppercase italic tracking-tight text-lg">
          Horarios de Atención
        </h2>
      </div>

      <div className="grid gap-3">
        {DIAS.map((dia) => {
          const dayConfig = schedule[dia.id];

          // Parseo seguro para compatibilidad con datos viejos
          const turnosValidos: FranjaHoraria[] = [];
          if (dayConfig) {
            if ("turnos" in dayConfig && Array.isArray(dayConfig.turnos)) {
              turnosValidos.push(...dayConfig.turnos);
            } else if ("inicio" in dayConfig && "fin" in dayConfig) {
              const inicio =
                typeof dayConfig.inicio === "string"
                  ? dayConfig.inicio
                  : "09:00";
              const fin =
                typeof dayConfig.fin === "string" ? dayConfig.fin : "18:00";
              turnosValidos.push({ inicio, fin });
            }
          }
          const isOpen = turnosValidos.length > 0;

          return (
            <div
              key={dia.id}
              className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-neo border-2 transition-all gap-4 ${
                isOpen
                  ? "border-black bg-primary/10"
                  : "border-gray-200 opacity-50 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-4 select-none flex-shrink-0">
                <input
                  type="checkbox"
                  id={`check-${dia.id}`}
                  checked={isOpen}
                  onChange={(e) => updateDay(dia.id, e.target.checked)}
                  className="w-5 h-5 accent-black cursor-pointer"
                />
                <label
                  htmlFor={`check-${dia.id}`}
                  className="font-black uppercase italic text-xs w-20 cursor-pointer"
                >
                  {dia.label}
                </label>
              </div>

              {isOpen && (
                <div className="flex flex-col gap-2 w-full md:w-auto items-start md:items-end">
                  {turnosValidos.map((turno, idx) => (
                    <div
                      key={`${dia.id}-turno-${idx}`}
                      className="flex items-center gap-3 w-full justify-between md:justify-end animate-in fade-in slide-in-from-left-2 duration-200"
                    >
                      <span className="text-[9px] font-black uppercase opacity-50 font-mono">
                        T{idx + 1}:
                      </span>

                      <input
                        type="time"
                        value={turno.inicio}
                        onChange={(e) =>
                          updateTurnoTime(dia.id, idx, "inicio", e.target.value)
                        }
                        className="bg-white border-2 border-black p-2 rounded-lg text-xs font-bold font-mono outline-none focus:bg-custom transition-colors"
                      />

                      <span className="text-[10px] font-black uppercase font-mono">
                        a
                      </span>

                      <input
                        type="time"
                        value={turno.fin}
                        onChange={(e) =>
                          updateTurnoTime(dia.id, idx, "fin", e.target.value)
                        }
                        className="bg-white border-2 border-black p-2 rounded-lg text-xs font-bold font-mono outline-none focus:bg-custom transition-colors"
                      />

                      {idx > 0 ? (
                        <button
                          type="button"
                          onClick={() => removeTurno(dia.id, idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        turnosValidos.length < 2 && (
                          <button
                            type="button"
                            onClick={() => addTurno(dia.id)}
                            className="flex items-center gap-1 px-2.5 py-2 border-2 border-dashed border-black hover:bg-custom rounded-lg transition-all text-[10px] font-black uppercase italic cursor-pointer"
                          >
                            <Plus size={12} strokeWidth={3} /> Cortado
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isOpen && (
                <span className="text-[10px] font-black uppercase opacity-40 italic tracking-widest font-mono">
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
