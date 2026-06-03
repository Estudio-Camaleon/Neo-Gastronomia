import type { Tables, TablesInsert } from "./database.types";

// ── Negocio ──────────────────────────────────────────
export type NegocioRow = Tables<"negocios">;

export interface NegocioPublico {
  id: string;
  nombre: string;
  slug: string;
  color_primary: string | null;
  banner_url: string | null;
  logo_url: string | null;
  direccion: string | null;
  localidad: string | null;
  direccion_notas: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  horarios: Record<string, HorarioDia> | null;
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
}

export interface ProductoConConfig extends Omit<ProductoRow, "configuracion"> {
  configuracion: ProductoConfiguracion | null;
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
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
  detalles?: string | null;
}

export interface PedidoData {
  id: string;
  estado: OrderStatus;
  cliente_nombre: string;
  metodo_pago: string;
  total: number;
  cliente_whatsapp: string;
  es_delivery: boolean;
  direccion_entrega?: string | null;
  notas?: string | null;
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
  direccion: string;
  localidad: string;
  direccion_notas: string;
  color_primary: string;
  logo_url: string;
  banner_url: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  horarios: Record<string, unknown>;
}

// ── Enums ────────────────────────────────────────────
export interface CatalogClientProps {
  negocio: NegocioPublico;
  categorias: CategoriaConProductos[];
}

export const ORDER_STATUS = {
  PENDIENTE: "pendiente",
  EN_PREPARACION: "en_preparacion",
  ENTREGADO: "entregado",
  CANCELADO: "cancelado",
} as const satisfies Record<string, OrderStatus>;
