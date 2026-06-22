"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LifeBuoy,
  Mail,
  MessageCircle,
  ChevronDown,
  BookOpen,
  Smartphone,
  Store,
  ShoppingBag,
  CreditCard,
  Settings,
  Search,
} from "lucide-react";
import "../../marketing/style/home.css";
import "../../marketing/style/shapes.css";

const supportEmail = "soporteneotuc@gmail.com";
const whatsappNumber = "+5491123456789";
const appVersion = "1.1.1";

interface FaqItem {
  pregunta: string;
  respuesta: string;
}

interface FaqCategory {
  icon: React.ElementType;
  titulo: string;
  items: FaqItem[];
}

const faqCategories: FaqCategory[] = [
  {
    icon: BookOpen,
    titulo: "Primeros pasos",
    items: [
      {
        pregunta: "¿Cómo creo mi catálogo digital?",
        respuesta:
          "Al registrarte, NEO crea automáticamente tu catálogo. Solo tenés que completar los datos de tu negocio, agregar productos y personalizar los colores. Tu menú digital estará disponible al instante en neocatalog.com.ar/tu-slug.",
      },
      {
        pregunta: "¿Cómo comparto mi menú con mis clientes?",
        respuesta:
          "Podés compartir el enlace directo de tu catálogo por WhatsApp, redes sociales o generar un código QR desde el panel de configuración. También podés incrustarlo en tu sitio web.",
      },
      {
        pregunta: "¿Qué necesito para empezar?",
        respuesta:
          "Solo necesitás un número de WhatsApp, el nombre de tu negocio y ganas de digitalizarte. No requerimos conocimientos técnicos ni diseño web.",
      },
    ],
  },
  {
    icon: Store,
    titulo: "Gestión del catálogo",
    items: [
      {
        pregunta: "¿Cómo agrego un producto?",
        respuesta:
          "Desde el panel de control, andá a Productos → Agregar producto. Completá nombre, precio, categoría, y subí una foto. También podés agregar variantes (tamaños) y opciones extras (ingredientes adicionales).",
      },
      {
        pregunta: "¿Cómo categorizo mis productos?",
        respuesta:
          "En la sección Categorías del panel podés crear y ordenar las categorías de tu menú. Luego al crear o editar un producto, asignale una categoría para que aparezca agrupado en tu menú digital.",
      },
      {
        pregunta: "¿Puedo desactivar un producto sin borrarlo?",
        respuesta:
          "Sí, cada producto tiene un interruptor de disponibilidad. Podés desactivarlo temporalmente y volver a activarlo cuando quieras sin perder su configuración.",
      },
      {
        pregunta: "¿Cómo agrego opciones extras a un producto?",
        respuesta:
          "Al editar un producto, en la sección 'Personalización' podés crear grupos de opciones (ej: 'Agregados', 'Bebidas') y definir si el cliente puede elegir una o varias, con precios adicionales y límite de cantidad por opción.",
      },
    ],
  },
  {
    icon: ShoppingBag,
    titulo: "Pedidos y entregas",
    items: [
      {
        pregunta: "¿Cómo recibo los pedidos de mis clientes?",
        respuesta:
          "Los pedidos llegan directamente a tu WhatsApp. Cuando un cliente completa un pedido, recibe un resumen y vos recibís todos los detalles automáticamente en tu número de negocio.",
      },
      {
        pregunta: "¿Puedo configurar delivery y retiro?",
        respuesta:
          "Sí, desde la configuración podés activar el costo de envío y definir un pedido mínimo. El cliente podrá elegir entre retirar en el local o recibir a domicilio.",
      },
      {
        pregunta: "¿Qué es la recepción pausada?",
        respuesta:
          "Si necesitás dejar de recibir pedidos temporalmente, podés pausar la recepción desde el panel. Tus clientes verán un aviso y no podrán confirmar pedidos hasta que la reactives.",
      },
    ],
  },
  {
    icon: CreditCard,
    titulo: "Pagos y suscripción",
    items: [
      {
        pregunta: "¿Cuánto cuesta NEO?",
        respuesta:
          "NEO tiene un plan FREE con todas las funciones básicas para empezar. El plan PRO ofrece funcionalidades avanzadas como suscripciones recurrentes mediante Mercado Pago. Consultá la sección de Planes para ver los precios actualizados.",
      },
      {
        pregunta: "¿Cómo funciona el pago con Mercado Pago?",
        respuesta:
          "Mercado Pago es la plataforma de pagos integrada. Los clientes pueden pagar con débito, crédito o efectivo a través de Mercado Pago. Las suscripciones PRO se procesan automáticamente de forma segura.",
      },
      {
        pregunta: "¿Puedo cancelar mi suscripción?",
        respuesta:
          "Sí, podés cancelar en cualquier momento desde la sección de Suscripción en el panel de control. La cancelación se procesa al final del período facturado.",
      },
    ],
  },
  {
    icon: Settings,
    titulo: "Solución de problemas",
    items: [
      {
        pregunta: "No veo los cambios que guardé",
        respuesta:
          "Probá refrescar la página (F5) y limpiar la caché del navegador (Ctrl+Shift+R). Si el problema persiste, asegurate de haber hecho clic en 'Guardar cambios' en cada sección.",
      },
      {
        pregunta: "Las imágenes no se cargan correctamente",
        respuesta:
          "Verificá que las imágenes estén en formato JPG, PNG o WebP y no superen los 5 MB. Si el problema continúa, intentá recortar la imagen a una resolución cuadrada para mejores resultados.",
      },
      {
        pregunta: "Mi menú no aparece en el buscador",
        respuesta:
          "El menú se actualiza automáticamente, pero puede tardar unos minutos en reflejarse. Si pasó más de 10 minutos, comunicate con soporte para que revisemos tu caso.",
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[var(--theme-border)] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 py-4 px-1 text-left transition-colors hover:text-[var(--theme-primary)]"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-[var(--theme-text)] pr-2">{item.pregunta}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[var(--theme-text-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 px-1">
          <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">{item.respuesta}</p>
        </div>
      )}
    </div>
  );
}

function FaqCategoryCard({ category, searchQuery }: { category: FaqCategory; searchQuery: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const Icon = category.icon;

  const filtered = category.items.filter(
    (item) =>
      item.pregunta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.respuesta.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (filtered.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-5 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--theme-primary-soft)] text-[var(--theme-primary)]">
          <Icon size={16} />
        </div>
        <h3 className="text-sm font-bold text-[var(--theme-text)]">{category.titulo}</h3>
      </div>
      <div className="px-5 pb-2">
        {filtered.map((item, idx) => (
          <AccordionItem
            key={idx}
            item={item}
            isOpen={openIndex === idx}
            onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
          />
        ))}
      </div>
    </div>
  );
}

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="neo-home font-sans min-h-screen w-full">
      <div className="neo-home-shell relative mx-auto flex min-h-screen w-full flex-col">
        <div className="relative z-10 flex min-h-screen flex-col w-full">
          {/* ── Navbar simple ── */}
          <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4">
            <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between rounded-[20px] glass-card">
              <a href="/" className="flex items-center gap-2 group shrink-0">
                <div className="p-1.5 sm:p-2 rounded-xl transition-transform group-hover:rotate-6 duration-300">
                  <Image
                    src="/icons/neo_logo_negro.webp"
                    alt="NEO"
                    width={40}
                    height={40}
                    priority
                    sizes="40px"
                    className="object-contain w-9 h-9 sm:w-10 sm:h-10"
                  />
                </div>
              </a>
              <div className="flex items-center gap-4">
                <a
                  href="/"
                  className="text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors"
                >
                  Volver al inicio
                </a>
              </div>
            </nav>
          </header>

          <main className="flex-grow w-full">
            {/* ── Hero ── */}
            <section className="relative px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--theme-primary-soft)] px-4 py-1.5 text-[10px] font-bold text-[var(--theme-primary)] uppercase tracking-wider mb-6">
                  <LifeBuoy size={12} />
                  Centro de Ayuda
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--theme-text)] leading-tight tracking-tight">
                  ¿En qué podemos ayudarte?
                </h1>
                <p className="mt-4 text-sm sm:text-base text-[var(--theme-text-muted)] max-w-xl mx-auto leading-relaxed">
                  Encontrá respuestas a las preguntas más frecuentes o contactanos directamente por
                  los canales de soporte.
                </p>

                {/* Buscador */}
                <div className="relative max-w-md mx-auto mt-8">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscá en el centro de ayuda..."
                    aria-label="Buscar en el centro de ayuda"
                    className="w-full rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface-strong)] py-3 pl-11 pr-4 text-sm text-[var(--theme-text)] outline-none placeholder:text-[var(--theme-text-muted)] focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/20 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* ── Canales de soporte ── */}
            <section className="px-4 sm:px-6 lg:px-8 pb-8">
              <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-4 flex items-center gap-3 group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 group-hover:bg-green-200 transition-colors">
                    <MessageCircle size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--theme-text)]">WhatsApp</p>
                    <p className="text-[10px] text-[var(--theme-text-muted)] truncate">Chateá con soporte</p>
                  </div>
                </a>
                <a
                  href={`mailto:${supportEmail}`}
                  className="glass-card p-4 flex items-center gap-3 group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                    <Mail size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--theme-text)]">Email</p>
                    <p className="text-[10px] text-[var(--theme-text-muted)] truncate">{supportEmail}</p>
                  </div>
                </a>
                <a
                  href="/ayuda/guias"
                  className="glass-card p-4 flex items-center gap-3 group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 group-hover:bg-amber-200 transition-colors">
                    <BookOpen size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--theme-text)]">Guías</p>
                    <p className="text-[10px] text-[var(--theme-text-muted)] truncate">Tutoriales y recursos</p>
                  </div>
                </a>
              </div>
            </section>

            {/* ── FAQ ── */}
            <section className="px-4 sm:px-6 lg:px-8 pb-16">
              <div className="mx-auto max-w-3xl space-y-6">
                {faqCategories.map((cat) => (
                  <FaqCategoryCard key={cat.titulo} category={cat} searchQuery={searchQuery} />
                ))}
                {faqCategories.every(
                  (cat) =>
                    cat.items.filter(
                      (item) =>
                        item.pregunta.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.respuesta.toLowerCase().includes(searchQuery.toLowerCase()),
                    ).length === 0,
                ) && (
                  <div className="glass-card p-8 text-center">
                    <p className="text-sm font-semibold text-[var(--theme-text)]">
                      No encontramos resultados para "{searchQuery}"
                    </p>
                    <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                      Probá con otros términos o contactanos directamente.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </main>

          {/* ── Footer ── */}
          <footer className="border-t border-[var(--theme-border)] px-4 sm:px-6 lg:px-8 py-6">
            <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[10px] text-[var(--theme-text-muted)]">
                <Smartphone size={12} />
                <span>App v{appVersion}</span>
                <span className="text-[var(--theme-border)]">·</span>
                <span>NeoCatalog</span>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <a href="mailto:{supportEmail}" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors">
                  {supportEmail}
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
