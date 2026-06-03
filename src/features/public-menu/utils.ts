import type { HorarioDia } from "./types";

export const DAYS_ORDER = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
] as const;

export const DAY_LABELS: Record<(typeof DAYS_ORDER)[number], string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

export function getTodayKey(): (typeof DAYS_ORDER)[number] | null {
  const formatter = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    timeZone: "America/Argentina/Buenos_Aires",
  });

  const dayName = formatter
    .format(new Date())
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (DAYS_ORDER.includes(dayName as (typeof DAYS_ORDER)[number])) {
    return dayName as (typeof DAYS_ORDER)[number];
  }
  return null;
}

export function formatTurnos(dia?: HorarioDia | null) {
  if (!dia) return "Cerrado";

  const turnos = dia.turnos || [];
  if (turnos.length === 0) return "Cerrado";

  return turnos.map((turno) => `${turno.inicio} - ${turno.fin}`).join(" · ");
}
