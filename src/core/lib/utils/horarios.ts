interface FranjaHoraria {
  inicio: string;
  fin: string;
}

interface HorarioDia {
  turnos: FranjaHoraria[];
}

interface HorarioViejo {
  inicio?: string;
  fin?: string;
  turnos?: never;
}

/**
 * Evalúa si el negocio se encuentra actualmente abierto según su configuración horaria.
 * Resguarda la consistencia horaria multi-tenant adaptándose al huso horario objetivo.
 */
export function estaAbierto(
  horariosRaw: unknown,
  timezone = "America/Argentina/Buenos_Aires",
): boolean {
  if (!horariosRaw || typeof horariosRaw !== "object") return false;

  const horarios = horariosRaw as Record<
    string,
    HorarioDia | HorarioViejo | undefined
  >;

  // Resolvemos el tiempo real localizado del cliente, aislando la hora UTC del servidor cloud
  const ahora = new Date();

  // Extraemos el string del día de la semana correcto según la localización del local
  const formatterDia = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    timeZone: timezone,
  });
  // Limpiamos acentos por consistencia con tu diccionario de días (ej: miércoles -> miercoles)
  const diaActualSaneado = formatterDia
    .format(ahora)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const dayConfig = horarios[diaActualSaneado];
  if (!dayConfig) return false;

  const turnosHoy: FranjaHoraria[] = [];

  if ("turnos" in dayConfig && Array.isArray(dayConfig.turnos)) {
    turnosHoy.push(...dayConfig.turnos);
  } else if ("inicio" in dayConfig && "fin" in dayConfig) {
    const inicio =
      typeof dayConfig.inicio === "string" ? dayConfig.inicio : null;
    const fin = typeof dayConfig.fin === "string" ? dayConfig.fin : null;
    if (inicio && fin) turnosHoy.push({ inicio, fin });
  }

  if (turnosHoy.length === 0) return false;

  // Extraemos las horas y minutos localizados exactos del huso horario objetivo
  const formatterHora = new Intl.DateTimeFormat("es-AR", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: timezone,
  });

  const [horaLocal, minLocal] = formatterHora
    .format(ahora)
    .split(":")
    .map(Number);
  const ahoraEnMinutosLocal = horaLocal * 60 + minLocal;

  return turnosHoy.some((turno) => {
    const [horaInicio, minInicio] = turno.inicio.split(":").map(Number);
    const [horaFin, minFin] = turno.fin.split(":").map(Number);

    // Protección contra NaN si el string está malformado
    if (
      !Number.isFinite(horaInicio) ||
      !Number.isFinite(minInicio) ||
      !Number.isFinite(horaFin) ||
      !Number.isFinite(minFin)
    ) {
      return false;
    }

    const inicioEnMinutos = horaInicio * 60 + minInicio;
    let finEnMinutos = horaFin * 60 + minFin;

    // 00:00 a 00:00 = abierto las 24 horas del día
    if (inicioEnMinutos === 0 && finEnMinutos === 0) {
      return true;
    }

    // Manejo nativo de turnos nocturnos gastronómicos que cierran de madrugada (ej: 20:00 a 02:00)
    if (finEnMinutos < inicioEnMinutos) {
      // Si la hora actual es posterior al inicio, el turno termina al día siguiente (+24hs)
      if (ahoraEnMinutosLocal >= inicioEnMinutos) {
        finEnMinutos += 24 * 60;
      } else {
        // Si la hora actual es de madrugada previa al cierre, sumamos un día completo al tiempo actual
        return (
          ahoraEnMinutosLocal + 24 * 60 >= inicioEnMinutos &&
          ahoraEnMinutosLocal + 24 * 60 <= finEnMinutos + 24 * 60
        );
      }
    }

    return (
      ahoraEnMinutosLocal >= inicioEnMinutos &&
      ahoraEnMinutosLocal <= finEnMinutos
    );
  });
}
