export const FOOD_ICONS = {
  huevo_frito: { label: "Huevo Frito", path: "/food-icons/huevo_frito.svg" },
  jamon_v2: { label: "Jamón (v2)", path: "/food-icons/jamon_v2.svg" },
  jamon: { label: "Jamón", path: "/food-icons/jamon.svg" },
  medallon_de_hamburguesa: { label: "Medallón", path: "/food-icons/medallon_de_hamburguesa.svg" },
  papas_fritas_sueltas: { label: "Papas Fritas", path: "/food-icons/papas_fritas_sueltas.svg" },
  queso_en_feta: { label: "Queso", path: "/food-icons/queso_en_feta.svg" },
  tiras_de_bacon: { label: "Bacon", path: "/food-icons/tiras_de_bacon.svg" },
} as const;

export type FoodIconKey = keyof typeof FOOD_ICONS;
