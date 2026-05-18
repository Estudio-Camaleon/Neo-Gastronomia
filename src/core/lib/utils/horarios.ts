// Interfaces atómicas para soportar múltiples turnos por día (Horario Cortado)
interface FranjaHoraria {
  inicio: string;
  fin: string;
}

interface HorarioDia {
  turnos: FranjaHoraria[];
}

// Interfaz auxiliar para mantener la retrocompatibilidad con registros viejos en Supabase
interface HorarioViejo {
  inicio?: string;
  fin?: string;
  turnos?: never;
}


/**
 * Evalúa si el negocio se encuentra actualmente abierto según su configuración horaria indexada.
 * Soporta de forma nativa tanto el formato viejo de un turno único como el nuevo esquema de múltiples turnos.
 */
export function estaAbierto(horariosRaw: unknown): boolean {
  if (!horariosRaw || typeof horariosRaw !== "object") return false;

  // Casteo seguro al diccionario de días
  const horarios = horariosRaw as Record<
    string,
    HorarioDia | HorarioViejo | undefined
  >;

  const ahora = new Date();
  const diasSemana = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];

  const diaActual = diasSemana[ahora.getDay()];
  const dayConfig = horarios[diaActual];

  if (!dayConfig) return false;

  // 🚀 PARSEO SEGURO: Extraemos todas las franjas horarias de hoy sin importar el formato
  const turnosHoy: FranjaHoraria[] = [];

  if ("turnos" in dayConfig && Array.isArray(dayConfig.turnos)) {
    // Formato Nuevo: Múltiples turnos
    turnosHoy.push(...dayConfig.turnos);
  } else if ("inicio" in dayConfig && "fin" in dayConfig) {
    // Formato Viejo: Turno único/corrido
    const inicio =
      typeof dayConfig.inicio === "string" ? dayConfig.inicio : null;
    const fin = typeof dayConfig.fin === "string" ? dayConfig.fin : null;
    if (inicio && fin) {
      turnosHoy.push({ inicio, fin });
    }
  }

  // Si no hay ningún turno cargado o el día está marcado como cerrado, retornamos false
  if (turnosHoy.length === 0) return false;

  // Calculamos los minutos transcurridos del día de hoy
  const ahoraEnMinutos = ahora.getHours() * 60 + ahora.getMinutes();

  // 🚀 EVALUACIÓN MULTI-TURNO:
  // Usamos .some() para verificar si la hora actual calza en AL MENOS UNO de los turnos de hoy
  return turnosHoy.some((turno) => {
    const [horaInicio, minInicio] = turno.inicio.split(":").map(Number);
    const [horaFin, minFin] = turno.fin.split(":").map(Number);

    const inicioEnMinutos = horaInicio * 60 + minInicio;
    const finEnMinutos = horaFin * 60 + minFin;

    return ahoraEnMinutos >= inicioEnMinutos && ahoraEnMinutos <= finEnMinutos;
  });
}
