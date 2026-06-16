/**
 * Formatea un número como pesos argentinos.
 * Ejemplo: 1250.5 → "$1.250,50"
 */
export function formatPesos(value: number, simbolo = "$"): string {
  return `${simbolo}${value.toLocaleString("es-AR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Un cliente "virtual" es aquel creado automáticamente desde un pedido
 * sin registro explícito (su id empieza con "virtual_").
 */
export function esClienteVirtual(clienteId: string): boolean {
  return clienteId.startsWith("virtual_");
}
