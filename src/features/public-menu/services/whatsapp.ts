import { toast } from "sonner";
import type { CartItem } from "@/features/public-menu/cart/useCartStore";
import type { OrderFormValues } from "@/features/public-menu/schemas";

export function formatearExtras(i: CartItem): string {
  if (!i.extras || i.extras.length === 0) return "";
  if (i.producto_id.startsWith("combo-")) {
    try {
      const comboItems = JSON.parse(i.detalles || "[]") as Array<{
        nombre_producto: string;
        cantidad: number;
      }>;
      return comboItems
        .map((ci) => `${ci.cantidad}x ${ci.nombre_producto}`)
        .join(", ");
    } catch {
      return "";
    }
  }
  return i.extras
    .map((e) => {
      const cant = e.cantidad ?? 1;
      return cant > 1 ? `${cant}x ${e.item_nombre}` : e.item_nombre;
    })
    .join(", ");
}

export function dispararWhatsAppExterno(
  negocioWhatsapp: string,
  pedidoId: string,
  formData: OrderFormValues,
  cart: CartItem[],
  subtotal: number,
  costoEnvioActual: number,
  totalFinal: number,
  simbolo: string,
  formatMoneyFn: (value: number, simbolo?: string) => string,
  discountAmount?: number,
  promoName?: string,
): boolean {
  const numeroLimpio = negocioWhatsapp.replace(/\D/g, "");
  if (!numeroLimpio) return false;

  const lineasDetalle = cart.map((i) => {
    const extrasStr = formatearExtras(i);
    const extraPart = extrasStr ? ` (_${extrasStr}_)` : "";
    return `• ${i.cantidad}x ${i.nombre.toUpperCase()}${extraPart} - ${formatMoneyFn(i.precio * i.cantidad, simbolo)}`;
  });

  const MAX_DETALLE_ITEMS = 12;
  const detalleTruncado =
    lineasDetalle.length > MAX_DETALLE_ITEMS
      ? [
          ...lineasDetalle.slice(0, MAX_DETALLE_ITEMS),
          `... y ${lineasDetalle.length - MAX_DETALLE_ITEMS} productos más.`,
        ]
      : lineasDetalle;

  const mensaje = [
    `*🆕 NUEVO PEDIDO (#${pedidoId.slice(0, 6).toUpperCase()})*`,
    `👤 *Cliente:* ${formData.nombre.toUpperCase()}`,
    `📱 *WhatsApp:* ${formData.whatsapp}`,
    `🛵 *Entrega:* ${formData.esDelivery ? `DELIVERY\n📍 *Dirección:* ${(formData.direccion || "").toUpperCase()}` : "RETIRO EN LOCAL"}`,
    `💳 *Pago:* ${formData.metodoPago.toUpperCase()}`,
    `\n📦 *DETALLE DE COMANDA:*`,
    ...detalleTruncado,
    `\n---`,
    `*Subtotal:* ${formatMoneyFn(subtotal, simbolo)}`,
    formData.esDelivery
      ? `*Envío:* ${formatMoneyFn(costoEnvioActual, simbolo)}`
      : "",
    discountAmount && discountAmount > 0
      ? `*🎉 Descuento (${promoName || "Promo"}):* -${formatMoneyFn(discountAmount, simbolo)}`
      : "",
    `*💰 TOTAL FINAL: ${formatMoneyFn(totalFinal, simbolo)}*`,
    `\n📝 *Notas:* ${formData.notas || "Sin especificaciones."}`,
    `\n_Enviado de forma segura desde NEO Infrastructure_`,
  ]
    .filter(Boolean)
    .join("\n");

  const waUrl = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
  const opened = window.open(waUrl);

  if (!opened || opened.closed) {
    navigator.clipboard?.writeText(waUrl).catch(() => {});
    toast.error(
      "No pudimos abrir WhatsApp automáticamente. Copiamos el enlace en tu portapapeles para que lo pegues manualmente.",
      { duration: 8000 },
    );
    return false;
  }

  return true;
}
