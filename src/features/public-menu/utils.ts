import type { HorarioDia, PromoRow } from "./types";
import type { CartItem } from "@/features/public-menu/cart/useCartStore";

export const COMBO_PREFIX = "combo-";

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

export function formatMoney(value: number, simbolo = "$"): string {
  return `${simbolo}${value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatTurnos(dia?: HorarioDia | null) {
  if (!dia) return "Cerrado";

  const turnos = dia.turnos || [];
  if (turnos.length === 0) return "Cerrado";

  // Si algún turno es 00:00-00:00 significa 24 horas
  const hasFullDay = turnos.some(
    (t) => t.inicio === "00:00" && t.fin === "00:00",
  );
  if (hasFullDay) return "24 horas";

  return turnos.map((turno) => `${turno.inicio} - ${turno.fin}`).join(" · ");
}

export function getDiscountLabel(promo: PromoRow): string {
  if (promo.tipo_descuento === "porcentaje") {
    return `${promo.valor_descuento}% OFF`;
  }
  return `$${Number(promo.valor_descuento).toLocaleString("es-AR")} OFF`;
}

export function getPromoSubtotal(
  promo: PromoRow,
  cart: CartItem[],
  productCategoryMap: Record<string, string>,
): number {
  const aplicarA = promo.aplicar_a as
    | { productos?: string[]; categorias?: string[] }
    | null
    | undefined;

  if (!aplicarA) {
    return cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  const affected = new Set(aplicarA.productos ?? []);

  const catIds = aplicarA.categorias ?? [];
  if (catIds.length > 0) {
    const targetCats = new Set(catIds);
    for (const item of cart) {
      const catId = productCategoryMap[item.producto_id];
      if (catId && targetCats.has(catId)) {
        affected.add(item.producto_id);
      }
    }
  }

  if (affected.size === 0) {
    return cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  return cart.reduce((acc, item) => {
    if (affected.has(item.producto_id)) {
      return acc + item.precio * item.cantidad;
    }
    return acc;
  }, 0);
}

export interface PromoDetail {
  nombre: string;
  label: string;
  monto: number;
}

export function calculateDiscounts(
  promos: PromoRow[],
  cart: CartItem[],
  productCategoryMap: Record<string, string>,
): { total: number; details: PromoDetail[] } {
  let total = 0;
  const details: PromoDetail[] = [];

  for (const promo of promos) {
    const applicableSubtotal = getPromoSubtotal(promo, cart, productCategoryMap);
    if (applicableSubtotal <= 0) continue;
    let monto = 0;
    if (promo.tipo_descuento === "porcentaje") {
      monto = Math.round(applicableSubtotal * (promo.valor_descuento / 100));
    } else {
      monto = Math.min(Number(promo.valor_descuento), applicableSubtotal);
    }
    total += monto;
    details.push({ nombre: promo.nombre, label: getDiscountLabel(promo), monto });
  }

  return { total, details };
}
