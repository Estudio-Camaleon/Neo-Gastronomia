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

// Interfaz auxiliar de seguridad para leer registros viejos en la base de datos sin romper tipos
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
  onChange: (newSchedule: ScheduleData) => void;
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
    const newSchedule = { ...schedule };
    if (!active) {
      delete newSchedule[day];
    } else {
      // Inicializa con un turno por defecto
      newSchedule[day] = {
        turnos: [{ inicio: "09:00", fin: "13:00" }],
      };
    }
    onChange(newSchedule);
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
      {/* Cabecera del Editor Horario */}
      <div className="flex items-center gap-3 mb-6">
        <Clock className="text-primary w-5 h-5" />
        <h2 className="font-black uppercase italic tracking-tight text-lg text-text-primary dark:text-text-inverse">
          Horarios de Atención
        </h2>
      </div>

      {/* Grilla Semanal */}
      <div className="grid gap-3">
        {DIAS.map((dia) => {
          const dayConfig = schedule[dia.id];

          // 🚀 PARSEO SEGURO: Type Narrowing nativo sin usar "any" ni parches externos
          const turnosValidos: FranjaHoraria[] = [];
          if (dayConfig) {
            if ("turnos" in dayConfig && Array.isArray(dayConfig.turnos)) {
              turnosValidos.push(...dayConfig.turnos);
            } else if ("inicio" in dayConfig && "fin" in dayConfig) {
              const inicio =
                typeof dayConfig.inicio === "string"
                  ? dayConfig.inicio
                  : "19:00";
              const fin =
                typeof dayConfig.fin === "string" ? dayConfig.fin : "23:59";
              turnosValidos.push({ inicio, fin });
            }
          }
          const isOpen = turnosValidos.length > 0;

          return (
            <div
              key={dia.id}
              className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-neo border-2 transition-all gap-4 ${
                isOpen
                  ? "border-primary/30 dark:border-primary/40 bg-primary/5 dark:bg-primary/10"
                  : "border-border dark:border-border-dark opacity-50 bg-bg-main dark:bg-bg-dark/10"
              }`}
            >
              {/* Checkbox de Control del Día */}
              <div className="flex items-center gap-4 select-none flex-shrink-0">
                <input
                  type="checkbox"
                  id={`check-${dia.id}`}
                  checked={isOpen}
                  onChange={(e) => updateDay(dia.id, e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer rounded-sm border-2 border-border"
                />
                <label
                  htmlFor={`check-${dia.id}`}
                  className="font-black uppercase italic text-xs w-20 cursor-pointer text-text-primary dark:text-text-inverse"
                >
                  {dia.label}
                </label>
              </div>

              {/* Listado de Franjas Horarias del Día */}
              {isOpen && (
                <div className="flex flex-col gap-2 w-full md:w-auto items-start md:items-end">
                  {turnosValidos.map((turno, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 w-full justify-between md:justify-end animate-in fade-in slide-in-from-left-2 duration-200"
                    >
                      <span className="text-[9px] font-black uppercase opacity-50 font-mono text-text-secondary dark:text-text-muted">
                        F{idx + 1}:
                      </span>

                      <input
                        type="time"
                        value={turno.inicio}
                        onChange={(e) =>
                          updateTurnoTime(dia.id, idx, "inicio", e.target.value)
                        }
                        className="bg-white dark:bg-bg-dark border-2 border-border dark:border-border-dark p-2 rounded-lg text-xs font-bold font-mono outline-none focus:border-primary text-text-primary dark:text-text-inverse transition-colors"
                      />

                      <span className="text-[10px] font-black opacity-40 text-text-primary dark:text-text-inverse uppercase font-mono">
                        A
                      </span>

                      <input
                        type="time"
                        value={turno.fin}
                        onChange={(e) =>
                          updateTurnoTime(dia.id, idx, "fin", e.target.value)
                        }
                        className="bg-white dark:bg-bg-dark border-2 border-border dark:border-border-dark p-2 rounded-lg text-xs font-bold font-mono outline-none focus:border-primary text-text-primary dark:text-text-inverse transition-colors"
                      />

                      {/* Botón de borrado para el segundo turno */}
                      {idx > 0 ? (
                        <button
                          type="button"
                          onClick={() => removeTurno(dia.id, idx)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar Franja"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        /* Botón para Añadir Franja si trabaja cortado (Solo si no hay un segundo turno activo) */
                        turnosValidos.length < 2 && (
                          <button
                            type="button"
                            onClick={() => addTurno(dia.id)}
                            className="flex items-center gap-1 px-2.5 py-2 border-2 border-dashed border-primary/50 text-primary dark:text-text-inverse hover:bg-primary/10 rounded-lg transition-all text-[10px] font-black uppercase italic cursor-pointer"
                          >
                            <Plus size={12} strokeWidth={3} /> Cortado
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Cartel de Cerrado */}
              {!isOpen && (
                <span className="text-[10px] font-black uppercase opacity-40 italic tracking-widest text-text-primary dark:text-text-inverse font-mono">
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
