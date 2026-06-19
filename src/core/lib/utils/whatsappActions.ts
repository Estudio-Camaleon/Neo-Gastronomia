import type { PedidoData } from "@/core/types/domain";

const MENSAJES_POR_DEFECTO: Record<string, string> = {
  en_preparacion: "¡Hola {cliente}! 👋 Soy de {negocio}. Te confirmo que recibimos tu pedido correctamente y ya entró a cocina. 🍳🔥 Te aviso por acá apenas esté listo. ¡Muchas gracias!",
  entregado: "¡Buenas noticias {cliente}! 🥳 Tu pedido de {negocio} ya está listo. {entrega} ¡Que lo disfrutes!",
  cancelado: "Hola {cliente}, te contactamos de {negocio}. Lamentablemente no vamos a poder procesar tu pedido en este momento. 🙏 Disculpá las molestias.",
};

function reemplazarVariables(
  template: string,
  cliente: string,
  negocioNombre: string,
  esDelivery: boolean,
): string {
  return template
    .replace(/\{cliente\}/g, cliente)
    .replace(/\{negocio\}/g, negocioNombre)
    .replace(/\{entrega\}/g, esDelivery ? "El repartidor va en camino 🛵" : "Ya podés pasar a retirarlo por el local 🛍️");
}

export const enviarNotificacionWhatsApp = (
  pedido: PedidoData,
  nuevoEstado: PedidoData["estado"],
  negocioNombre: string,
  mensajesPersonalizados?: Record<string, string> | null,
) => {
  const telefono = pedido.cliente_whatsapp;
  const cliente = pedido.cliente_nombre.split(" ")[0];

  if (nuevoEstado === "pendiente") return;

  const plantillas = mensajesPersonalizados || MENSAJES_POR_DEFECTO;
  const template = plantillas[nuevoEstado as keyof typeof plantillas];
  if (!template) return;

  const mensaje = reemplazarVariables(template, cliente, negocioNombre, pedido.es_delivery);
  const waUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(waUrl, "_blank");
};
