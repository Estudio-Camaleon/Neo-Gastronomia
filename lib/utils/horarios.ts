import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export function estaAbierto(horarios: any): boolean {
  // 1. Si horarios es null o undefined, permitimos la venta por defecto
  // (O podés retornar false si preferís que esté cerrado por defecto)
  if (!horarios) return true;

  const zonaHoraria = "America/Argentina/Buenos_Aires";
  const ahora = toZonedTime(new Date(), zonaHoraria);

  const diaSemana = ahora.getDay(); // 0-6
  const horaActual = format(ahora, "HH:mm");

  // 2. Acceso seguro a la propiedad
  const horarioHoy = horarios[diaSemana.toString()] || horarios[diaSemana];

  if (!horarioHoy || horarioHoy.cerrado_todo_dia) {
    return false;
  }

  return horaActual >= horarioHoy.abierto && horaActual <= horarioHoy.cerrado;
}
