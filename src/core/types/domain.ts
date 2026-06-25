import type { Tables, TablesInsert } from "./database.types";

// ── Negocio ──────────────────────────────────────────
export type NegocioRow = Tables<"negocios">;

export interface DireccionFisica {
  id: string;
  nombre: string;
  direccion: string;
  localidad: string;
  coordenadas?: { lat: number; lng: number } | null;
  es_principal?: boolean;
}

export interface NegocioPublico {
  id: string;
  nombre: string;
  descripcion: string | null;
  slug: string;
  color_primary: string | null;
  banner_url: string | null;
  banner_posicion?: string;
  banner_height?: string;
  banner_scale?: number;
  logo_url: string | null;
  logo_scale?: number;
  logo_posicion?: string;
  logo_fit?: string;
  logo_shape?: string;
  mostrar_nombre?: boolean;
  direccion: string | null;
  localidad: string | null;
  direccion_notas: string | null;
  direcciones?: DireccionFisica[];
  whatsapp: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  tripadvisor_url: string | null;
  redes_principales?: string[];
  horarios: Record<string, HorarioDia> | null;
  whatsapp_mensajes?: Record<string, string> | null;
  recepcion_pausada?: boolean;
  moneda_simbolo?: string;
  pedido_minimo?: number;
  costo_envio?: number;
}

// ── Categoría ────────────────────────────────────────
export type CategoriaRow = Tables<"categorias">;

export interface CategoriaConProductos extends CategoriaRow {
  productos: ProductoConConfig[];
}

// ── Producto ─────────────────────────────────────────
export type ProductoRow = Tables<"productos">;
export type ProductoInsert = TablesInsert<"productos">;

export interface ExtraItem {
  id: string;
  nombre: string;
  precio: number;
  icono?: string;
  /** Maximum quantity the customer can select (undefined = unlimited) */
  max?: number;
}

export interface ExtraGroup {
  id: string;
  titulo: string;
  requerido: boolean;
  multiple: boolean;
  items: ExtraItem[];
}

export interface ProductoConfiguracion {
  variantes?: Array<{ nombre: string; precio: number }>;
  grupos_opciones?: ExtraGroup[];
  imagenes_extra?: string[];
}

export interface ProductoConConfig extends Omit<ProductoRow, "configuracion"> {
  configuracion: ProductoConfiguracion | null;
  imagenes_extra?: string[];
}

// ── Cliente ──────────────────────────────────────────
export type ClienteRow = Tables<"clientes">;

export interface ClienteResumen {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  totalGasto: number;
  pedidos: number;
  ultimoPedido: string | null;
  notas: string | null;
}

// ── Pedido ───────────────────────────────────────────
export type PedidoRow = Tables<"pedidos">;
export type PedidoInsert = TablesInsert<"pedidos">;

export type OrderStatus =
  | "pendiente"
  | "en_preparacion"
  | "entregado"
  | "cancelado";

export interface PedidoItem {
  id: string;
  producto_id: string | null;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
  detalles?: string | null;
}

export interface PedidoData {
  id: string;
  negocio_id?: string;
  estado: OrderStatus;
  cliente_nombre: string;
  cliente_whatsapp: string;
  metodo_pago: string;
  total: number;
  es_delivery: boolean;
  direccion_entrega?: string | null;
  notas?: string | null;
  created_at: string;
  pedido_items: PedidoItem[];
}

// ── Horarios ─────────────────────────────────────────
export interface Turno {
  inicio: string;
  fin: string;
}

export interface HorarioDia {
  turnos: Turno[];
}

// ── Branding ─────────────────────────────────────────
export interface UpdateTenantBrandingPayload {
  id: string;
  nombre: string;
  slug: string;
  whatsapp: string;
  descripcion: string;
  direccion: string;
  localidad: string;
  direccion_notas: string;
  color_primary: string;
  logo_url: string;
  logo_scale: number;
  logo_posicion: string;
  logo_fit: string;
  logo_shape: string;
  banner_url: string;
  banner_posicion: string;
  banner_height: string;
  banner_scale: number;
  mostrar_nombre: boolean;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  twitter_url: string;
  youtube_url: string;
  redes_principales: string[];
  horarios: Record<string, unknown>;
  direcciones: DireccionFisica[];
  whatsapp_mensajes?: Record<string, string> | null;
}

// ── Promo ────────────────────────────────────────────
export type PromoRow = Tables<"promos">;
export type PromoConGaleria = PromoRow & { imagenes_extra?: string[] };

// ── Enums ────────────────────────────────────────────
export interface CatalogClientProps {
  negocio: NegocioPublico;
  categorias: CategoriaConProductos[];
}

// ── Notificaciones ────────────────────────────────────
export type NotificationType =
  | "new_order"
  | "order_update"
  | "system"
  | "promo_ending"
  | "stock_alert";

export const NOTIFICATION_TYPES: NotificationType[] = [
  "new_order",
  "order_update",
  "system",
  "promo_ending",
  "stock_alert",
];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  new_order: "Nuevo pedido",
  order_update: "Actualización de pedido",
  system: "Aviso del sistema",
  promo_ending: "Promoción por vencer",
  stock_alert: "Stock bajo",
};

export const NOTIFICATION_TYPE_DESCRIPTIONS: Record<NotificationType, string> = {
  new_order: "Cuando un cliente realiza un pedido nuevo",
  order_update: "Cuando cambia el estado de un pedido",
  system: "Avisos importantes sobre el sistema o tu cuenta",
  promo_ending: "Cuando una promoción está por finalizar",
  stock_alert: "Cuando un producto tiene poco stock",
};

export type NotificationRow = Tables<"notifications">;

export interface NotificationData {
  id: string;
  negocio_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  negocio_id: string;
  notification_type: NotificationType;
  enabled: boolean;
}

export const ORDER_STATUS = {
  PENDIENTE: "pendiente",
  EN_PREPARACION: "en_preparacion",
  ENTREGADO: "entregado",
  CANCELADO: "cancelado",
} as const satisfies Record<string, OrderStatus>;
