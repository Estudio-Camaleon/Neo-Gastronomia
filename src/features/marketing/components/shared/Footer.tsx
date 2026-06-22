"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";

const LegalModal = dynamic(() => import("./LegalModal").then((m) => ({ default: m.LegalModal })), {
  ssr: false,
});

export function Footer() {
  const currentYear = new Date().getFullYear();

  // Estado para controlar qué modal está abierto
  const [activeModal, setActiveModal] = useState<"terms" | "privacy" | null>(
    null,
  );

  const sections = [
    {
      title: "Producto",
      links: [
        { name: "Beneficios", href: "#features" },
        { name: "Cómo funciona", href: "#how-it-works" },
        { name: "Planes y Precios", href: "#planes" },
        { name: "Casos de éxito", href: "#testimonials" },
      ],
    },
    {
      title: "Acceso Rápido",
      links: [
        { name: "Ingresar al panel", href: "/login" },
        { name: "Crear mi menú gratis", href: "/registro" },
        { name: "Centro de Ayuda", href: "/ayuda" },
        { name: "Guías y Tutoriales", href: "/ayuda/guias" },
      ],
    },
    {
      title: "Legal",
      // Cambiamos 'href' por 'action' para abrir los modales
      items: [
        {
          name: "Términos y condiciones",
          action: () => setActiveModal("terms"),
        },
        {
          name: "Políticas de privacidad",
          action: () => setActiveModal("privacy"),
        },
      ],
    },
  ];

  return (
    <>
      <footer className="relative w-full overflow-hidden bg-[linear-gradient(180deg,var(--theme-text),#0a1811)] pt-16 pb-8 sm:pt-32 sm:pb-12 mt-20 border-t-4 border-[var(--theme-primary)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--theme-primary)] opacity-20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[var(--theme-accent)] opacity-10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 items-start mb-12 md:mb-20">
            {/* Brand Column */}
            <div className="sm:col-span-2 flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 sm:p-3 rounded-2xl transition-transform hover:scale-105 duration-300">
                  <Image
                    src="/icons/neo_logo_blanco.webp"
                    alt="NEO"
                    width={70}
                    height={70}
                    priority
                    sizes="80px"
                    className="object-contain w-16 h-16 sm:w-20 sm:h-20"
                  />
                </div>
              </div>
              <p className="text-sm sm:text-base text-white/70 max-w-sm leading-relaxed">
                El sistema definitivo para digitalizar tu restaurante, eliminar
                comisiones abusivas y aumentar tus ganancias reales.
              </p>
            </div>

            {/* Dynamic Nav Columns */}
            {sections.map((section) => (
              <div
                key={section.title}
                className="flex flex-col gap-4 sm:gap-5 mt-0"
              >
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {section.links?.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="group text-sm font-medium text-white/80 hover:text-[var(--theme-accent)] flex items-center gap-1.5 transition-all duration-300 hover:translate-x-2 py-1 touch-target min-h-[44px]"
                      >
                        {link.name}
                        {link.href.startsWith("http") && (
                          <ArrowUpRight className="w-3 h-3 text-white/50 group-hover:text-[var(--theme-accent)] transition-colors" />
                        )}
                      </Link>
                    </li>
                  ))}
                  {section.items?.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={item.action}
                        className="group text-sm font-medium text-white/80 hover:text-[var(--theme-accent)] flex items-center gap-1.5 transition-all duration-300 hover:translate-x-2 text-left py-1 touch-target min-h-[44px]"
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row lg:flex-row items-center justify-between gap-4 sm:gap-6 border-t border-white/10 pt-6 sm:pt-8 text-sm font-medium text-white/50">
            <p className="text-center sm:text-left">
              &copy; {currentYear} NEO. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-2 text-sm">
              <span>Creado por</span>
              <a
                href="https://www.estudiocamaleontuc.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1 text-white hover:text-[var(--theme-accent)] transition-colors font-black border-b border-white/30 hover:border-[var(--theme-accent)] pb-0.5"
              >
                Estudio Camaleón
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- MODALES LEGALES --- */}

      {/* Modal: Términos y Condiciones */}
      <LegalModal
        isOpen={activeModal === "terms"}
        onClose={() => setActiveModal(null)}
        title="Términos y Condiciones"
      >
        <div className="space-y-4">
          <p>
            <strong>1. Aceptación de los términos</strong>
            <br />
            Al acceder y utilizar los servicios de NEO (en adelante, "la
            Plataforma"), usted acepta estar sujeto a estos Términos y
            Condiciones. Si no está de acuerdo con alguna parte de los términos,
            no podrá acceder al servicio.
          </p>

          <p>
            <strong>2. Uso del Servicio</strong>
            <br />
            NEO provee un software como servicio (SaaS) diseñado para la
            creación de menús digitales y gestión de pedidos vía WhatsApp para
            establecimientos gastronómicos. Usted es responsable de mantener la
            confidencialidad de su cuenta y contraseña.
          </p>

          <p>
            <strong>3. Pagos y Suscripciones</strong>
            <br />
            Los planes de suscripción se facturan por adelantado en un ciclo
            mensual. No existen reembolsos o créditos por meses parciales de
            servicio, ni por meses en los que la cuenta estuvo activa pero no
            fue utilizada.
          </p>

          <p>
            <strong>4. Contenido del Usuario</strong>
            <br />
            Usted conserva todos los derechos sobre la información, fotos y
            precios que suba a la plataforma. NEO no se hace responsable por
            errores en los precios o descripciones publicadas por los comercios.
          </p>

          <p>
            <strong>5. Disponibilidad del Servicio</strong>
            <br />
            Nos esforzamos por garantizar un 99.9% de tiempo de actividad. Sin
            embargo, el servicio puede estar sujeto a interrupciones ocasionales
            por mantenimiento o causas de fuerza mayor.
          </p>
        </div>
      </LegalModal>

      {/* Modal: Políticas de Privacidad */}
      <LegalModal
        isOpen={activeModal === "privacy"}
        onClose={() => setActiveModal(null)}
        title="Políticas de Privacidad"
      >
        <div className="space-y-4">
          <p>
            <strong>1. Recopilación de Información</strong>
            <br />
            Recopilamos información cuando se registra en nuestro sitio, ingresa
            a su cuenta y/o cierra sesión. La información recopilada incluye su
            nombre, dirección de correo electrónico y número de teléfono.
          </p>

          <p>
            <strong>2. Uso de la Información</strong>
            <br />
            Cualquier información que recopilamos de usted puede ser utilizada
            para: personalizar su experiencia, mejorar nuestro sitio web,
            mejorar el servicio al cliente y procesar transacciones.
          </p>

          <p>
            <strong>3. Protección de Datos del Consumidor Final</strong>
            <br />
            NEO actúa como un facilitador. Los datos ingresados por los
            consumidores finales al realizar un pedido (nombre, teléfono,
            dirección) son enviados directamente al WhatsApp del comercio. NEO
            no comercializa bases de datos de consumidores.
          </p>

          <p>
            <strong>4. Uso de Cookies</strong>
            <br />
            Utilizamos cookies propias y de terceros para mejorar el acceso a
            nuestro sitio, identificar visitantes recurrentes y mejorar la
            experiencia del usuario rastreando sus intereses.
          </p>

          <p>
            <strong>5. Consentimiento</strong>
            <br />
            Al utilizar nuestro sitio, usted acepta nuestra política de
            privacidad de forma íntegra.
          </p>
        </div>
      </LegalModal>
    </>
  );
}
