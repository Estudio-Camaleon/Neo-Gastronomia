import type { DireccionFisica } from "@/core/types/domain";
import {
  Pizza,
  Beef,
  Coffee,
  CupSoda,
  Sandwich,
  IceCream,
  UtensilsCrossed,
  Apple,
  Cookie,
  Croissant,
  Star,
  Heart,
  Sparkles,
  Moon,
  Diamond,
  Ghost,
  Wine,
  Salad,
} from "lucide-react";

// ── Horarios ─────────────────────────────────────────────
export interface FranjaHoraria {
  inicio: string;
  fin: string;
}

export interface HorarioDia {
  turnos?: FranjaHoraria[];
}

export interface ScheduleData {
  [dayId: string]: HorarioDia | undefined;
}

export const DIAS = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

// ── Negocio / Config Form State ──────────────────────────
export interface NegocioInitialData {
  id: string;
  nombre: string;
  slug: string;
  whatsapp: string;
  descripcion?: string;
  direccion: string;
  localidad?: string;
  direccion_notas?: string;
  color_primary: string;
  logo_url: string;
  logo_scale?: number;
  logo_posicion?: string;
  logo_fit?: string;
  logo_shape?: string;
  banner_url: string;
  banner_posicion?: string;
  banner_height?: string;
  banner_scale?: number;
  mostrar_nombre?: boolean;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  tripadvisor_url?: string;
  horarios: ScheduleData;
  direcciones?: DireccionFisica[];
  /**
   * Puede venir como string[] (legacy) o como
   * { shapes: string[]; density: 'low' | 'medium' | 'high' } (nuevo formato).
   */
  floating_shapes?: string[] | { shapes: string[]; density: string };
}

export interface ConfigFormState {
  nombre: string;
  slug: string;
  whatsapp: string;
  descripcion: string;
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
  tripadvisor_url: string;
  horarios: ScheduleData;
  direcciones: DireccionFisica[];
  floating_shapes: string[];
  floating_density: "low" | "medium" | "high";
}

// ── Color palettes ───────────────────────────────────────
export interface ColorPaletteGroup {
  label: string;
  colors: string[];
}

export const COLOR_PALETTES: ColorPaletteGroup[] = [
  {
    label: "Fríos",
    colors: [
      "#2563eb",
      "#06b6d4",
      "#0891b2",
      "#4f46e5",
      "#6366f1",
      "#0ea5e9",
      "#14b8a6",
    ],
  },
  {
    label: "Cálidos",
    colors: [
      "#dc2626",
      "#ea580c",
      "#f59e0b",
      "#eab308",
      "#f97316",
      "#b91c1c",
      "#d97706",
    ],
  },
  {
    label: "Pasteles",
    colors: [
      "#f472b6",
      "#60a5fa",
      "#818cf8",
      "#facc15",
      "#34d399",
      "#f87171",
      "#a78bfa",
    ],
  },
  {
    label: "Vibrantes",
    colors: [
      "#ff006e",
      "#8338ec",
      "#3a86ff",
      "#34a35f",
      "#ffbe0b",
      "#fb5607",
      "#06d6a0",
    ],
  },
  {
    label: "Neutros",
    colors: [
      "#0f172a",
      "#1e293b",
      "#475569",
      "#64748b",
      "#78716c",
      "#292524",
      "#000000",
    ],
  },
];

// ── Branding options ─────────────────────────────────────
export const BANNER_VERTICAL_OPTIONS = [
  { value: "top", label: "Arriba" },
  { value: "center", label: "Centro" },
  { value: "bottom", label: "Abajo" },
] as const;

export const BANNER_HEIGHT_OPTIONS = [
  { value: "compact", label: "Compacto" },
  { value: "normal", label: "Normal" },
  { value: "large", label: "Grande" },
] as const;

export const LOGO_POSITION_OPTIONS = [
  { value: "top", label: "Arriba" },
  { value: "center", label: "Centro" },
  { value: "bottom", label: "Abajo" },
] as const;

export const LOGO_FIT_OPTIONS = [
  { value: "contain", label: "Ajustar" },
  { value: "cover", label: "Cubrir" },
] as const;

export const LOGO_SHAPE_OPTIONS = [
  { value: "none", label: "Ninguna" },
  { value: "circle", label: "Círculo" },
  { value: "rounded", label: "Redondeado" },
  { value: "square", label: "Cuadrado" },
] as const;

// ── Floating shapes ──────────────────────────────────────
export interface ShapeOption {
  value: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  category: "comida" | "bebida" | "abstracto";
}

export const FOOD_SHAPES: ShapeOption[] = [
  // ── Comida ─────────────────────────────
  { value: "Pizza", label: "Pizza", Icon: Pizza, category: "comida" },
  { value: "Beef", label: "Hamburguesa", Icon: Beef, category: "comida" },
  { value: "Sandwich", label: "Sándwich", Icon: Sandwich, category: "comida" },
  { value: "IceCream", label: "Helado", Icon: IceCream, category: "comida" },
  { value: "UtensilsCrossed", label: "Pastas", Icon: UtensilsCrossed, category: "comida" },
  { value: "Cookie", label: "Galleta", Icon: Cookie, category: "comida" },
  { value: "Croissant", label: "Croissant", Icon: Croissant, category: "comida" },
  { value: "Apple", label: "Manzana", Icon: Apple, category: "comida" },
  { value: "Salad", label: "Ensalada", Icon: Salad, category: "comida" },
  // ── Bebida ─────────────────────────────
  { value: "Coffee", label: "Café", Icon: Coffee, category: "bebida" },
  { value: "CupSoda", label: "Gaseosa", Icon: CupSoda, category: "bebida" },
  { value: "Wine", label: "Vino", Icon: Wine, category: "bebida" },
  // ── Abstracto ──────────────────────────
  { value: "Star", label: "Estrella", Icon: Star, category: "abstracto" },
  { value: "Heart", label: "Corazón", Icon: Heart, category: "abstracto" },
  { value: "Sparkles", label: "Destellos", Icon: Sparkles, category: "abstracto" },
  { value: "Moon", label: "Luna", Icon: Moon, category: "abstracto" },
  { value: "Diamond", label: "Diamante", Icon: Diamond, category: "abstracto" },
  { value: "Ghost", label: "Fantasma", Icon: Ghost, category: "abstracto" },
];

// ── Image limits ─────────────────────────────────────────
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
