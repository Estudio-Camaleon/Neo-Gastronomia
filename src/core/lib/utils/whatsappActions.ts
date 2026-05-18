// lib/utils/whatsappActions.ts
import { PedidoData } from "@/features/order-engine/admin-components/PedidosRadar";

export const enviarNotificacionWhatsApp = (
  pedido: PedidoData,
  nuevoEstado: PedidoData["estado"],
  negocioNombre: string,
) => {
  const telefono = pedido.cliente_whatsapp;
  const cliente = pedido.cliente_nombre.split(" ")[0]; // Solo el primer nombre

  let mensaje = "";

  const plantillas = {
    en_preparacion: `¡Hola *${cliente}*! 👋 Soy de *${negocioNombre}*. Te confirmo que recibimos tu pedido correctamente y ya entró a cocina. 🍳🔥 Te aviso por acá apenas esté listo. ¡Muchas gracias!`,
    entregado: `¡Buenas noticias *${cliente}*! 🥳 Tu pedido de *${negocioNombre}* ya está listo. ${pedido.es_delivery ? "El repartidor va en camino 🛵" : "Ya podés pasar a retirarlo por el local 🛍️"}. ¡Que lo disfrutes!`,
    cancelado: `Hola *${cliente}*, te contactamos de *${negocioNombre}*. Lamentablemente no vamos a poder procesar tu pedido en este momento. 🙏 Disculpá las molestias.`,
  };

  if (
    nuevoEstado === "pendiente" ||
    !plantillas[nuevoEstado as keyof typeof plantillas]
  )
    return;

  mensaje = plantillas[nuevoEstado as keyof typeof plantillas];
  const waUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(waUrl, "_blank");
};
