"use client";

import { Search, Clock, ChevronDown } from "lucide-react";
import { useState } from "react";

// Sincronizado con las keys del ScheduleEditor
const DIAS_ORDENADOS = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

export function PublicNavbar({
  logo,
  nombre,
  horarios,
}: {
  logo?: string;
  nombre: string;
  horarios?: any;
}) {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-xl border-b-2 border-border/50 px-6 py-4 flex justify-between items-center transition-all">
      <div className="flex items-center gap-8">
        {/* Logo o Brand Name Estilo NEO */}
        {logo ? (
          <img
            src={logo}
            alt={nombre}
            className="h-10 w-auto object-contain hover:scale-105 transition-transform"
          />
        ) : (
          <span className="font-black text-2xl tracking-tighter text-primary uppercase italic">
            {nombre.split(" ")[0]}
          </span>
        )}

        {/* Selector de Horarios (Desktop) */}
        {horarios && (
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="flex items-center gap-3 px-4 py-2 rounded-neo bg-white dark:bg-bg-dark border-2 border-border text-[10px] font-black uppercase tracking-[0.15em] text-text-muted hover:border-primary hover:text-primary transition-all active:scale-95"
            >
              <Clock size={14} />
              Horarios
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${showSchedule ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown de Horarios Estilo Ticket */}
            {showSchedule && (
              <div className="absolute top-full left-0 mt-4 w-72 bg-white dark:bg-bg-darker shadow-2xl rounded-super border-2 border-border p-6 animate-in fade-in zoom-in-95 duration-200 z-[60]">
                <div className="text-center mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">
                    Cronograma Semanal
                  </p>
                  <div className="h-0.5 w-full bg-border/30 mt-2" />
                </div>

                <div className="space-y-3">
                  {DIAS_ORDENADOS.map((dia) => {
                    const h = horarios[dia.id];
                    return (
                      <div
                        key={dia.id}
                        className={`flex justify-between items-center text-[11px] ${!h ? "opacity-40" : ""}`}
                      >
                        <span className="font-bold uppercase tracking-tight text-text-muted">
                          {dia.label}
                        </span>
                        <span className="font-black text-text-primary italic">
                          {h ? (
                            `${h.inicio} — ${h.fin}`
                          ) : (
                            <span className="text-error uppercase text-[9px] tracking-widest">
                              Cerrado
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t-2 border-dashed border-border text-center">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest leading-tight">
                    Los horarios pueden variar <br /> en días feriados.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Acciones del Navbar */}
      <div className="flex items-center gap-4">
        <button className="p-3 bg-white dark:bg-bg-dark rounded-neo border-2 border-border text-text-primary hover:border-primary hover:text-primary active:scale-90 transition-all">
          <Search size={20} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
}
