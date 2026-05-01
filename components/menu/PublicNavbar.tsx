"use client";

import { Search, Clock, ChevronDown } from "lucide-react";
import { useState } from "react";

const DIAS_MAP: Record<string, string> = {
  "1": "Lunes",
  "2": "Martes",
  "3": "Miércoles",
  "4": "Jueves",
  "5": "Viernes",
  "6": "Sábado",
  "0": "Domingo",
};

export function PublicNavbar({
  logo,
  nombre,
  horarios,
}: {
  logo?: string;
  nombre: string;
  horarios?: any; // Recibimos el JSON de horarios
}) {
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg-public)]/80 backdrop-blur-xl border-b border-black/5 px-6 py-4 flex justify-between items-center transition-all">
      {/* Logo o Nombre */}
      <div className="flex items-center gap-6">
        {logo ? (
          <img src={logo} alt={nombre} className="h-9 w-auto object-contain" />
        ) : (
          <span className="font-black text-2xl tracking-tighter text-[var(--brand-color)]">
            {nombre.split(" ")[0]}
          </span>
        )}

        {/* Selector de Horarios (Desktop) */}
        {horarios && (
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/5 text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-gray-50 transition-all"
            >
              <Clock size={14} className="text-[var(--brand-color)]" />
              Horarios
              <ChevronDown
                size={12}
                className={`transition-transform ${showSchedule ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown de Horarios */}
            {showSchedule && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl rounded-2xl border border-black/5 p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-color)] mb-3 border-b pb-2">
                  Cronograma Semanal
                </p>
                <div className="space-y-2">
                  {Object.entries(DIAS_MAP).map(([key, label]) => {
                    const h = horarios[key];
                    return (
                      <div
                        key={key}
                        className="flex justify-between items-center text-[11px]"
                      >
                        <span className="font-bold text-gray-500">{label}</span>
                        <span className="font-black text-[var(--text-public)]">
                          {h?.cerrado_todo_dia ? (
                            <span className="text-red-500">Cerrado</span>
                          ) : (
                            `${h?.abierto} - ${h?.cerrado}`
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 bg-white rounded-full shadow-sm border border-black/5 text-[var(--text-public)] active:scale-90 transition-transform">
          <Search size={20} />
        </button>
      </div>
    </nav>
  );
}
