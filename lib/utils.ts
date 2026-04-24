import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Función utilitaria para combinar clases de Tailwind.
 * Permite pasar clases condicionales de forma limpia.
 * Ejemplo: cn("bg-blue-500", isActive && "text-white")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}