export function estaAbierto(horarios: any): boolean {
  if (!horarios) return false;

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
  const horarioHoy = horarios[diaActual];

  if (!horarioHoy) return false;

  const [horaInicio, minInicio] = horarioHoy.inicio.split(":").map(Number);
  const [horaFin, minFin] = horarioHoy.fin.split(":").map(Number);

  const ahoraEnMinutos = ahora.getHours() * 60 + ahora.getMinutes();
  const inicioEnMinutos = horaInicio * 60 + minInicio;
  const finEnMinutos = horaFin * 60 + minFin;

  return ahoraEnMinutos >= inicioEnMinutos && ahoraEnMinutos <= finEnMinutos;
}
