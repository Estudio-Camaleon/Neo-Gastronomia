"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { estaAbierto } from "@/lib/utils/horarios";

interface PedidoData {
  negocioId: string;
  nombre: string;
  whatsapp: string;
  direccion: string;
  total: number;
  metodoPago: string;
  notas?: string;
}

export async function crearPedido(datos: PedidoData, carrito: any[]) {
  // 1. Validación básica de entrada
  if (!carrito || carrito.length === 0) {
    return { success: false, error: "El carrito está vacío" };
  }

  try {
    // 2. Traemos los horarios del negocio desde la DB
    const { data: negocio, error: errorNegocio } = await supabaseAdmin
      .from("negocios")
      .select("horarios")
      .eq("id", datos.negocioId)
      .single();

    if (errorNegocio || !negocio) {
      console.error("Error al obtener negocio:", errorNegocio);
      return {
        success: false,
        error: "No se pudo verificar el estado del negocio",
      };
    }

    // 3. VALIDACIÓN DE HORARIOS (Lógica de Estudio Camaleón)
    // Si el local está cerrado, cortamos la ejecución aquí mismo.
    if (!estaAbierto(negocio.horarios)) {
      return {
        success: false,
        error:
          "El local se encuentra cerrado en este momento. Por favor, consulta los horarios de atención.",
      };
    }

    // 4. Insertamos el Pedido (Cabecera)
    const { data: pedido, error: errorPedido } = await supabaseAdmin
      .from("pedidos")
      .insert({
        negocio_id: datos.negocioId,
        cliente_nombre: datos.nombre,
        cliente_whatsapp: datos.whatsapp,
        direccion_entrega: datos.direccion,
        total: datos.total,
        metodo_pago: datos.metodoPago,
        notas: datos.notas,
        estado: "pendiente",
      })
      .select()
      .single();

    if (errorPedido) {
      console.error("Error Pedido:", errorPedido);
      return {
        success: false,
        error: "Error de base de datos al crear el pedido",
      };
    }

    // 5. Preparamos los items para inserción masiva
    const itemsParaInsertar = carrito.map((item) => ({
      pedido_id: pedido.id,
      producto_id: item.id,
      nombre_producto: item.nombre,
      precio_unitario: item.precio,
      cantidad: item.cantidad,
    }));

    // 6. Insertamos los items
    const { error: errorItems } = await supabaseAdmin
      .from("pedido_items")
      .insert(itemsParaInsertar);

    if (errorItems) {
      console.error("Error Items:", errorItems);
      // Opcional: Podrías borrar el pedido (rollback) si los items fallan
      return {
        success: false,
        error: "Pedido creado, pero falló el registro de productos",
      };
    }

    return { success: true, pedidoId: pedido.id };
  } catch (err) {
    console.error("Error inesperado en crearPedido:", err);
    return {
      success: false,
      error: "Ocurrió un error inesperado al procesar el pedido",
    };
  }
}
