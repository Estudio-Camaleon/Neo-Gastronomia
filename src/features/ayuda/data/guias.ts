export interface GuideStep {
  title: string;
  description: string;
  image?: string;
  tip?: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  steps: GuideStep[];
  relatedGuides: string[];
}

export const guideCategories = [
  { slug: "todas", label: "Todas" },
  { slug: "empezando", label: "Empezando" },
  { slug: "catalogo", label: "Catálogo" },
  { slug: "pedidos", label: "Pedidos" },
  { slug: "personalizacion", label: "Personalización" },
  { slug: "facturacion", label: "Facturación" },
] as const;

export const guias: Guide[] = [
  {
    slug: "crear-mi-catalogo",
    title: "Crear tu catálogo digital",
    description:
      "Aprendé a configurar tu negocio, agregar productos y tener tu menú digital funcionando en minutos.",
    category: "empezando",
    readTime: "5 min",
    steps: [
      {
        title: "Registrate en NEO",
        description:
          "Ingresá a neocatalog.com.ar y creá tu cuenta con tu número de WhatsApp. Es gratis y no requiere tarjeta.",
        image: "/ayuda/guias/thumb-crear-mi-catalogo.webp",
      },
      {
        title: "Completá los datos de tu negocio",
        description:
          "En el panel de control, andá a Configuración y completá el nombre, dirección, horarios y número de WhatsApp de tu negocio. Estos datos aparecerán en tu menú digital.",
        tip: "Usá un horario claro para que tus clientes sepan cuándo pueden hacer pedidos.",
      },
      {
        title: "Agregá tus productos",
        description:
          "Andá a Productos → Agregar producto. Completá nombre, precio, subí una foto y asignale una categoría. Repetí para cada producto de tu menú.",
      },
      {
        title: "Compartí tu menú",
        description:
          "Una vez que tenés productos cargados, ya podés compartir tu menú. Usá el enlace directo o generá un código QR desde la configuración.",
      },
    ],
    relatedGuides: ["personalizar-mi-catalogo", "agregar-productos"],
  },
  {
    slug: "personalizar-mi-catalogo",
    title: "Personalizar colores y logo",
    description:
      "Dale la identidad de tu marca a tu menú digital cambiando colores, logo y estilo visual.",
    category: "personalizacion",
    readTime: "4 min",
    steps: [
      {
        title: "Subí tu logo",
        description:
          "Desde Configuración → Marca, subí el logo de tu negocio. Se mostrará en la cabecera de tu menú digital. Usá una imagen cuadrada de al menos 200×200 px para mejor resultado.",
        image: "/ayuda/guias/thumb-personalizar-mi-catalogo.webp",
      },
      {
        title: "Elegí los colores de tu marca",
        description:
          "Personalizá el color primario, secundario y de fondo de tu menú. Usá el selector de color o ingresá el código HEX de tu marca. Los cambios se ven al instante.",
        tip: "Elegí colores con buen contraste para que el texto sea legible.",
      },
      {
        title: "Vista previa",
        description:
          "Antes de guardar, usá la vista previa para ver cómo queda tu menú en celular y desktop. Ajustá hasta que te guste el resultado.",
      },
    ],
    relatedGuides: ["crear-mi-catalogo", "categorias-y-orden"],
  },
  {
    slug: "agregar-productos",
    title: "Agregar productos y variantes",
    description:
      "Cargá productos con fotos, descripciones, precios y variantes como tamaños o sabores.",
    category: "catalogo",
    readTime: "6 min",
    steps: [
      {
        title: "Crear un producto nuevo",
        description:
          "En el panel, andá a Productos → Agregar producto. Completá nombre, descripción (opcional) y precio base.",
        image: "/ayuda/guias/thumb-agregar-productos.webp",
      },
      {
        title: "Agregar foto del producto",
        description:
          "Subí una foto del producto. Se recomienda formato cuadrado, fondo limpio y buena iluminación. Formatos aceptados: JPG, PNG, WebP. Máximo 5 MB.",
      },
      {
        title: "Crear variantes",
        description:
          "Si un producto viene en varios tamaños (ej: Chico $100, Grande $150), activá 'Variantes' y agregá cada opción con su precio. El cliente podrá elegir en el menú.",
        tip: "Usá variantes para el mismo producto con distintos precios. Para opciones adicionales, usá 'Extras'.",
      },
      {
        title: "Asignar categoría y publicar",
        description:
          "Elegí a qué categoría pertenece el producto y asegurate de que el interruptor de disponibilidad esté activado. ¡Listo para que tus clientes lo vean!",
      },
    ],
    relatedGuides: ["categorias-y-orden", "opciones-extras"],
  },
  {
    slug: "categorias-y-orden",
    title: "Organizar categorías del menú",
    description:
      "Aprendé a crear, ordenar y gestionar las categorías de tus productos para un menú bien organizado.",
    category: "catalogo",
    readTime: "3 min",
    steps: [
      {
        title: "Crear una categoría",
        description:
          "Andá a Categorías en el panel. Hacé clic en 'Agregar categoría', poné un nombre (ej: 'Platos principales', 'Bebidas') y guardá.",
        image: "/ayuda/guias/thumb-categorias-y-orden.webp",
      },
      {
        title: "Ordenar categorías",
        description:
          "Arrastrá las categorías para ordenarlas. Así se mostrarán en tu menú digital. La primera categoría será la que vean primero tus clientes.",
        tip: "Ordená las categorías de más a menos importante. También podés ocultar categorías sin borrarlas.",
      },
      {
        title: "Asignar productos a categorías",
        description:
          "Al crear o editar un producto, seleccioná su categoría. Un producto solo puede pertenecer a una categoría a la vez.",
      },
    ],
    relatedGuides: ["agregar-productos", "personalizar-mi-catalogo"],
  },
  {
    slug: "opciones-extras",
    title: "Configurar opciones y extras",
    description:
      "Agregá ingredientes adicionales, guarniciones o personalizaciones que el cliente pueda elegir.",
    category: "personalizacion",
    readTime: "5 min",
    steps: [
      {
        title: "Crear un grupo de extras",
        description:
          "Al editar un producto, andá a la sección 'Personalización'. Creá un grupo (ej: 'Agregados', 'Bebida incluida') y definí si el cliente puede elegir una o varias opciones.",
        image: "/ayuda/guias/thumb-opciones-extras.webp",
      },
      {
        title: "Agregar opciones al grupo",
        description:
          "Dentro del grupo, agregá cada opción con su precio adicional (o $0 si es gratis). Ej: 'Queso extra +$50', 'Sin cebolla $0'.",
        tip: "Usá el límite de cantidad para controlar cuántas opciones puede seleccionar el cliente (ej: máximo 3 agregados).",
      },
      {
        title: "Probar en el menú",
        description:
          "Abrí tu menú digital y buscá el producto. Vas a ver las opciones de personalización disponibles para elegir.",
      },
    ],
    relatedGuides: ["agregar-productos", "variantes"],
  },
  {
    slug: "gestionar-pedidos",
    title: "Gestionar pedidos entrantes",
    description:
      "Configurá cómo recibís los pedidos de tus clientes y gestioná el delivery.",
    category: "pedidos",
    readTime: "4 min",
    steps: [
      {
        title: "Configurar recepción de pedidos",
        description:
          "En el panel, andá a Configuración → Pedidos. Ingresá tu número de WhatsApp donde querés recibir las notificaciones de cada pedido.",
        image: "/ayuda/guias/thumb-gestionar-pedidos.webp",
      },
      {
        title: "Configurar delivery y retiro",
        description:
          "Activá 'Delivery' para ofrecer envío a domicilio con costo y pedido mínimo. Activá 'Retiro' para que los clientes pasen a buscar. Ambos pueden estar activos al mismo tiempo.",
        tip: "Definí un pedido mínimo para delivery que cubra el costo de envío y sea razonable para tus clientes.",
      },
      {
        title: "Pausar recepción temporalmente",
        description:
          "Si necesitás cerrar pedidos por el día, usá el interruptor 'Pausar recepción'. Tus clientes verán un aviso en el menú.",
      },
    ],
    relatedGuides: ["crear-mi-catalogo", "personalizar-mi-catalogo"],
  },
  {
    slug: "planes-y-suscripcion",
    title: "Planes y suscripción",
    description:
      "Conocé los planes disponibles, cómo suscribirte al plan PRO y gestionar tu facturación.",
    category: "facturacion",
    readTime: "3 min",
    steps: [
      {
        title: "Comparar planes",
        description:
          "NEO ofrece dos planes: FREE (gratuito, con todas las funciones esenciales) y PRO (con funcionalidades avanzadas como suscripciones recurrentes mediante Mercado Pago).",
        image: "/ayuda/guias/thumb-planes-y-suscripcion.webp",
      },
      {
        title: "Suscribirte al plan PRO",
        description:
          "Desde el panel, andá a Suscripción y elegí el plan PRO. El pago se procesa mediante Mercado Pago de forma segura. La suscripción se renueva automáticamente cada mes.",
        tip: "Podés cancelar en cualquier momento desde la misma sección. La cancelación se procesa al final del período facturado.",
      },
      {
        title: "Gestionar facturación",
        description:
          "En la sección Suscripción podés ver tu plan actual, historial de pagos y descargar facturas. Cualquier cambio se refleja al instante.",
      },
    ],
    relatedGuides: ["crear-mi-catalogo", "personalizar-mi-catalogo"],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return guias.find((g) => g.slug === slug);
}

export function getRelatedGuides(slug: string): Guide[] {
  const guide = getGuideBySlug(slug);
  if (!guide) return [];
  return guide.relatedGuides
    .map((s) => getGuideBySlug(s))
    .filter((g): g is Guide => g !== undefined);
}

export function getGuidesByCategory(category: string): Guide[] {
  if (category === "todas") return guias;
  return guias.filter((g) => g.category === category);
}
