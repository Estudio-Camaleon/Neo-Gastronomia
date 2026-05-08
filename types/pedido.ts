export interface PedidoItem {
  id: string;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
}

export interface PedidoData {
  id: string;
  estado: string; // Simplificamos para que no pelee con otros componentes
  cliente_nombre: string;
  cliente_whatsapp: string;
  es_delivery: boolean;
  total: number | string;
  direccion_entrega?: string | null;
  notas?: string | null;
  metodo_pago?: string | null;
  pedido_items?: PedidoItem[];
  created_at: string;
}
