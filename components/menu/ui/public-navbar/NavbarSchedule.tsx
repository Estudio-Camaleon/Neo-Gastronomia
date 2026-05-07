"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";

interface FranjaHoraria {
  inicio: string;
  fin: string;
}

interface HorarioDia {
  turnos?: FranjaHoraria[];
}

interface NavbarScheduleProps {
  horariosRaw: unknown;
  finalColor: string;
}

export function NavbarSchedule({
  horariosRaw,
  finalColor,
}: NavbarScheduleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const diasSemana = [
    { key: "lunes", label: "Lunes" },
    { key: "martes", label: "Martes" },
    { key: "miercoles", label: "Miércoles" },
    { key: "jueves", label: "Jueves" },
    { key: "viernes", label: "Viernes" },
    { key: "sabado", label: "Sábado" },
    { key: "domingo", label: "Domingo" },
  ];

  const horarios =
    (horariosRaw as Record<
      string,
      HorarioDia | Record<string, unknown> | undefined
    >) || {};

  const diasIngles = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  const hoyIndex = new Date().getDay();
  const diaHoyKey = diasIngles[hoyIndex];

  const dayConfigHoy = horarios[diaHoyKey];

  // 🚀 PARSEO SEGURO SIN ANY (Para el botón de hoy)
  const turnosHoy: FranjaHoraria[] = [];
  if (dayConfigHoy) {
    if ("turnos" in dayConfigHoy && Array.isArray(dayConfigHoy.turnos)) {
      turnosHoy.push(...dayConfigHoy.turnos);
    } else if ("inicio" in dayConfigHoy && "fin" in dayConfigHoy) {
      const inicio =
        typeof dayConfigHoy.inicio === "string" ? dayConfigHoy.inicio : "19:00";
      const fin =
        typeof dayConfigHoy.fin === "string" ? dayConfigHoy.fin : "23:59";
      turnosHoy.push({ inicio, fin });
    }
  }

  const rangoHoyTexto =
    turnosHoy.length > 0
      ? turnosHoy.map((t) => `${t.inicio} - ${t.fin}`).join(" | ")
      : "Cerrado hoy";

  return (
    <div ref={dropdownRef} className="relative z-40">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 text-left hover:opacity-80 transition-all cursor-pointer group select-none bg-transparent border-0 p-0"
      >
        <div className="p-2 rounded-xl bg-white dark:bg-white/5 border-2 border-border dark:border-border-dark shadow-xs flex-shrink-0 group-hover:border-gray-400 dark:group-hover:border-border-dark/80 transition-colors">
          <Clock style={{ stroke: finalColor }} size={20} strokeWidth={2.5} />
        </div>

        <div className="flex flex-col select-none max-w-[180px] sm:max-w-none">
          <span className="font-sans font-black uppercase italic text-xs lg:text-sm tracking-tight text-text-primary dark:text-text-inverse leading-none flex items-center gap-1">
            <span className="truncate">{rangoHoyTexto}</span>
            {isOpen ? (
              <ChevronUp
                size={12}
                strokeWidth={3}
                className="text-text-muted flex-shrink-0"
              />
            ) : (
              <ChevronDown
                size={12}
                strokeWidth={3}
                className="text-text-muted flex-shrink-0"
              />
            )}
          </span>
          <span className="text-[10px] lg:text-[11px] font-bold text-text-secondary dark:text-text-muted tracking-wide mt-1">
            Ver horarios de la semana
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-bg-darker border-2 border-black dark:border-border-dark rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[9px] font-black uppercase text-text-muted tracking-widest mb-3 italic border-b border-dashed border-border dark:border-border-dark pb-1.5">
            Cronograma Semanal
          </p>

          <div className="space-y-2.5 font-mono text-xs">
            {diasSemana.map((dia) => {
              const dayConfig = horarios[dia.key];

              // 🚀 PARSEO SEGURO SIN ANY (Para la lista semanal)
              const turnosDia: FranjaHoraria[] = [];
              if (dayConfig) {
                if ("turnos" in dayConfig && Array.isArray(dayConfig.turnos)) {
                  turnosDia.push(...dayConfig.turnos);
                } else if ("inicio" in dayConfig && "fin" in dayConfig) {
                  const inicio =
                    typeof dayConfig.inicio === "string"
                      ? dayConfig.inicio
                      : "19:00";
                  const fin =
                    typeof dayConfig.fin === "string" ? dayConfig.fin : "23:59";
                  turnosDia.push({ inicio, fin });
                }
              }

              const esHoy = dia.key === diaHoyKey;

              return (
                <div
                  key={dia.key}
                  className={`flex items-start justify-between py-1 px-1.5 rounded-md transition-colors ${
                    esHoy ? "bg-gray-100 dark:bg-white/10 font-bold" : ""
                  }`}
                >
                  <span
                    className={`text-text-primary dark:text-text-inverse ${esHoy ? "italic mt-0.5" : "mt-0.5"}`}
                  >
                    {dia.label} {esHoy && "•"}
                  </span>

                  {turnosDia.length > 0 ? (
                    <div className="flex flex-col items-end gap-0.5">
                      {turnosDia.map((turno, idx) => (
                        <span
                          key={idx}
                          className="text-text-secondary dark:text-text-muted font-black whitespace-nowrap"
                        >
                          {turno.inicio} - {turno.fin}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-error/70 font-black text-[10px] uppercase tracking-wider mt-0.5">
                      Cerrado
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
