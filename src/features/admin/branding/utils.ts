export const DEFAULT_WHATSAPP_MENSAJES: Record<string, string> = {
  en_preparacion:
    "¡Hola {cliente}! 👋 Soy de {negocio}. Te confirmo que recibimos tu pedido correctamente y ya entró a cocina. 🍳🔥 Te aviso por acá apenas esté listo. ¡Muchas gracias!",
  entregado:
    "¡Buenas noticias {cliente}! 🥳 Tu pedido de {negocio} ya está listo. {entrega} ¡Que lo disfrutes!",
  cancelado:
    "Hola {cliente}, te contactamos de {negocio}. Lamentablemente no vamos a poder procesar tu pedido en este momento. 🙏 Disculpá las molestias.",
};

export function parseWhatsApp(full: string) {
  if (full.startsWith("54")) return { pais: "54", numero: full.slice(2) };
  if (full.startsWith("52")) return { pais: "52", numero: full.slice(2) };
  if (full.startsWith("1")) return { pais: "1", numero: full.slice(1) };
  return { pais: "54", numero: full };
}
