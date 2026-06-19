import type { DireccionFisica } from "@/core/types/domain";

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
  horarios: ScheduleData;
  direcciones?: DireccionFisica[];
  whatsapp_mensajes?: Record<string, string> | null;
}

export interface ConfigFormState {
  nombre: string;
  slug: string;
  whatsapp_pais: string;
  whatsapp_numero: string;
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
  horarios: ScheduleData;
  direcciones: DireccionFisica[];
  whatsapp_mensajes: Record<string, string>;
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

// ── Localidades ──────────────────────────────────────────
export const LOCALIDADES_TUCUMAN = [
  "San Miguel de Tucumán",
  "Yerba Buena",
  "Tafí Viejo",
  "Concepción",
  "Aguilares",
  "Lules",
  "Famaillá",
  "Monteros",
  "Banda del Río Salí",
  "Alderetes",
  "Tafí del Valle",
  "Simoca",
  "Juan Bautista Alberdi",
  "Bella Vista",
  "La Cocha",
  "Graneros",
  "Trancas",
  "Burruyacú",
  "Chicligasta",
  "Río Chico",
];

// ── Image limits ─────────────────────────────────────────
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

// ── Países para WhatsApp ─────────────────────────────────
export const PAISES = [
  { code: "54", label: "Argentina (+54)" },
  { code: "52", label: "México (+52)" },
  { code: "34", label: "España (+34)" },
  { code: "1", label: "EE.UU./Canadá (+1)" },
  { code: "57", label: "Colombia (+57)" },
  { code: "56", label: "Chile (+56)" },
  { code: "51", label: "Perú (+51)" },
  { code: "598", label: "Uruguay (+598)" },
  { code: "595", label: "Paraguay (+595)" },
  { code: "591", label: "Bolivia (+591)" },
  { code: "58", label: "Venezuela (+58)" },
  { code: "593", label: "Ecuador (+593)" },
  { code: "506", label: "Costa Rica (+506)" },
  { code: "507", label: "Panamá (+507)" },
  { code: "502", label: "Guatemala (+502)" },
  { code: "503", label: "El Salvador (+503)" },
  { code: "504", label: "Honduras (+504)" },
  { code: "505", label: "Nicaragua (+505)" },
  { code: "53", label: "Cuba (+53)" },
  { code: "1-809", label: "Rep. Dominicana (+1-809)" },
  { code: "55", label: "Brasil (+55)" },
] as const;

// ── Códigos de área de Argentina → región ────────────────
export const AREA_CODES_ARG: Record<string, string> = {
  "11": "Buenos Aires (AMBA)",
  "221": "La Plata",
  "223": "Mar del Plata",
  "261": "Mendoza",
  "341": "Rosario",
  "342": "Santa Fe",
  "343": "Paraná",
  "351": "Córdoba",
  "362": "Resistencia",
  "376": "Posadas",
  "379": "Corrientes",
  "381": "Tucumán",
  "382": "Catamarca",
  "383": "La Rioja",
  "385": "Santiago del Estero",
  "387": "Salta",
  "388": "Jujuy",
  "264": "San Juan",
  "2657": "San Luis",
  "291": "Bahía Blanca",
  "299": "Neuquén",
  "280": "Puerto Madryn",
  "2966": "Río Gallegos",
  "2901": "Ushuaia",
  "358": "Río Cuarto",
  "370": "Formosa",
  "380": "La Rioja (capital)",
  "389": "Cafayate",
};

// ── Localidades por región ────────────────────────────────
export const LOCALIDADES_POR_REGION: Record<string, string[]> = {
  "Tucumán": LOCALIDADES_TUCUMAN,
  "Buenos Aires (AMBA)": [
    "CABA",
    "La Plata",
    "Avellaneda",
    "Lanús",
    "Lomas de Zamora",
    "Morón",
    "Quilmes",
    "San Isidro",
    "Vicente López",
    "Tigre",
    "San Fernando",
    "Almirante Brown",
    "Florencio Varela",
    "General San Martín",
    "Tres de Febrero",
  ],
  "Córdoba": [
    "Córdoba Capital",
    "Villa María",
    "Río Cuarto",
    "Carlos Paz",
    "Jesús María",
    "Cruz del Eje",
    "Bell Ville",
    "San Francisco",
  ],
  "Rosario": [
    "Rosario",
    "Funes",
    "Roldán",
    "Villa Gobernador Gálvez",
    "Granadero Baigorria",
    "Pérez",
    "Capitán Bermúdez",
  ],
  "Mendoza": [
    "Mendoza Capital",
    "Godoy Cruz",
    "Guaymallén",
    "Las Heras",
    "Maipú",
    "Luján de Cuyo",
    "San Rafael",
  ],
};

// ── Zonas por localidad ───────────────────────────
export const ZONAS_POR_LOCALIDAD: Record<string, string[]> = {
  "San Miguel de Tucumán": [
    "Zona céntrica",
    "Zona norte",
    "Zona sur",
    "Zona este",
    "Zona oeste",
  ],
  "Yerba Buena": [
    "Zona céntrica",
    "Zona residencial",
    "Zona comercial",
  ],
  "Tafí Viejo": [
    "Zona céntrica",
    "Zona residencial",
    "Zona industrial",
  ],
  "Concepción": [
    "Zona céntrica",
    "Zona sur",
    "Zona norte",
  ],
};

export function direccionesParaLocalidad(localidad: string): string[] {
  return ZONAS_POR_LOCALIDAD[localidad] || [
    "Zona céntrica",
    "Zona sur",
    "Zona norte",
  ];
}
export function detectarRegion(whatsappPais: string, whatsappNumero: string): string | null {
  if (whatsappPais !== "54") return null;
  const digits = whatsappNumero.replace(/\D/g, "");
  const prefijos = Object.keys(AREA_CODES_ARG).sort((a, b) => b.length - a.length);
  for (const prefijo of prefijos) {
    if (digits.startsWith(prefijo) || digits.startsWith("9" + prefijo)) {
      return AREA_CODES_ARG[prefijo];
    }
  }
  return null;
}

export function localidadesParaRegion(region: string | null): string[] {
  if (!region) return LOCALIDADES_TUCUMAN;
  return LOCALIDADES_POR_REGION[region] || LOCALIDADES_TUCUMAN;
}
