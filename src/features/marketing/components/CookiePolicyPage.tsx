"use client";

import { Navbar } from "./shared/Navbar";
import { Footer } from "./shared/Footer";
import { ShieldCheck, Cookie, Info, Settings, BarChart3, Database, HelpCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

const cookieCategories = [
  {
    id: "esenciales",
    title: "Cookies Técnicas (Esenciales)",
    icon: Settings,
    always: true,
    description:
      "Necesarias para el funcionamiento básico de la plataforma. Sin estas cookies, el servicio no puede operar correctamente.",
    examples: [
      "Mantenimiento de sesión de usuario autenticado",
      "Token CSRF para protección contra falsificación de solicitudes",
      "Configuración de idioma y preferencias regionales",
      "Balanceo de carga para estabilidad del servidor",
    ],
    duration: "Sesión / Persistente (máx. 24 h)",
  },
  {
    id: "funcionales",
    title: "Cookies de Preferencias",
    icon: Info,
    always: false,
    description:
      "Permiten recordar tus preferencias y personalizar la experiencia visual y funcional de la plataforma.",
    examples: [
      "Tema visual claro/oscuro seleccionado",
      "Estado de la barra lateral (colapsada/expandida)",
      "Preferencias de visualización de tablas y listados",
    ],
    duration: "Persistente (hasta 1 año)",
  },
  {
    id: "analiticas",
    title: "Cookies Analíticas",
    icon: BarChart3,
    always: false,
    description:
      "Recopilan información anónima sobre cómo los usuarios interactúan con la plataforma para mejorar su rendimiento y usabilidad.",
    examples: [
      "Páginas más visitadas y tiempos de permanencia",
      "Flujo de navegación dentro de la plataforma",
      "Errores técnicos y rendimiento de carga",
      "Datos agregados de uso del sistema (anónimos)",
    ],
    duration: "Persistente (hasta 2 años)",
  },
  {
    id: "terceros",
    title: "Cookies de Terceros",
    icon: Database,
    always: false,
    description:
      "Servicios externos que utilizamos para funcionalidades específicas. No compartimos datos personales con estos servicios.",
    examples: [
      "Vercel Analytics (datos anónimos de navegación)",
      "Sentry (monitoreo de errores, sin datos personales)",
      "Mercado Pago (procesamiento de pagos, datos manejados por ellos)",
    ],
    duration: "Según el proveedor",
  },
];

const faqItems = [
  {
    q: "¿Qué son las cookies?",
    a: "Son pequeños archivos de texto que el sitio web almacena en tu navegador para recordar información sobre tu visita. No contienen virus ni pueden ejecutar programas.",
  },
  {
    q: "¿Necesito aceptar todas las cookies?",
    a: "No. Solo las cookies esenciales son necesarias para el funcionamiento. Las cookies de preferencias y analíticas son opcionales y puedes rechazarlas sin que el servicio deje de funcionar.",
  },
  {
    q: "¿Cómo puedo gestionar las cookies desde mi navegador?",
    a: "Podés configurar tu navegador para bloquear o eliminar cookies desde su menú de configuración. Cada navegador tiene su propio método: Chrome (Configuración → Privacidad y seguridad), Firefox (Opciones → Privacidad y seguridad), Safari (Preferencias → Privacidad).",
  },
  {
    q: "¿Cambian las cookies que utiliza NEO?",
    a: "Podemos actualizar este aviso periódicamente. Te recomendamos revisarlo cada vez que cambien nuestras funcionalidades. La fecha de la última actualización se indica al final de esta página.",
  },
];

export function CookiePolicyPage() {
  return (
    <div className="neo-home font-sans selection:bg-[var(--theme-primary-soft)] selection:text-[var(--theme-text)] min-h-screen w-full">
      <div className="neo-home-shell relative mx-auto flex min-h-screen w-full flex-col bg-[linear-gradient(180deg,rgba(250,248,242,0.9),rgba(247,244,236,0.96))]">
        <div className="relative z-10 flex min-h-screen flex-col w-full overflow-hidden">
          <Navbar />

          <main id="main-content" className="flex-grow w-full pt-28 sm:pt-32">
            {/* ── HERO ── */}
            <section className="relative mx-auto max-w-4xl px-5 sm:px-8 pb-8 sm:pb-12">
              <div className="flex flex-col items-start gap-5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--theme-border)] bg-white/60 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--theme-muted)] shadow-xs">
                  <ShieldCheck size={13} strokeWidth={2.5} />
                  Legal
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--theme-text)] leading-[1.1]">
                  Aviso de{" "}
                  <span className="text-[var(--theme-primary)]">Cookies</span>
                </h1>
                <p className="text-base sm:text-lg leading-relaxed text-[var(--theme-muted)] max-w-2xl">
                  En NEO creemos en la transparencia total. Esta página explica
                  qué cookies utilizamos, por qué las usamos y cómo podés
                  gestionar tus preferencias en cualquier momento.
                </p>
                <div className="flex items-center gap-4 text-sm font-medium text-[var(--theme-muted)]">
                  <span className="flex items-center gap-1.5">
                    <Database size={14} strokeWidth={1.8} />
                    Última actualización: 29 de junio, 2026
                  </span>
                </div>
              </div>
            </section>

            {/* ── CATEGORÍAS DE COOKIES ── */}
            <section className="relative mx-auto max-w-4xl px-5 sm:px-8 pb-12 sm:pb-16">
              <div className="space-y-6">
                {cookieCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      className="group rounded-2xl border border-[var(--theme-border)] bg-white/70 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                        {/* Icon */}
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
                          <Icon size={22} strokeWidth={1.8} />
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                            <h2 className="text-lg font-bold text-[var(--theme-text)]">
                              {cat.title}
                            </h2>
                            {cat.always && (
                              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[var(--theme-primary)]/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--theme-primary)]">
                                Siempre activas
                              </span>
                            )}
                          </div>

                          <p className="text-sm leading-relaxed text-[var(--theme-muted)] mb-4">
                            {cat.description}
                          </p>

                          <div className="space-y-2 mb-4">
                            {cat.examples.map((ex, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2.5 text-sm text-[var(--theme-text)]/80"
                              >
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--theme-primary)]/40" />
                                {ex}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-xs font-medium text-[var(--theme-muted)]">
                            <Database size={12} strokeWidth={1.8} />
                            Duración: {cat.duration}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── CÓMO GESTIONAR LAS COOKIES ── */}
            <section className="relative mx-auto max-w-4xl px-5 sm:px-8 pb-12 sm:pb-16">
              <div className="rounded-2xl border border-[var(--theme-border)] bg-gradient-to-br from-[var(--theme-primary)]/5 to-transparent p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary)]/15 text-[var(--theme-primary)]">
                    <HelpCircle size={22} strokeWidth={1.8} />
                  </span>
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-[var(--theme-text)]">
                      ¿Cómo gestionar tus preferencias?
                    </h2>
                    <p className="text-sm leading-relaxed text-[var(--theme-muted)] max-w-2xl">
                      Podés aceptar o rechazar las cookies no esenciales
                      mediante el banner que aparece al ingresar a la
                      plataforma. También podés configurar tu navegador para
                      bloquearlas o eliminarlas desde el menú de ajustes.
                    </p>
                    <p className="text-sm leading-relaxed text-[var(--theme-muted)]">
                      Si en el futuro querés modificar tu elección, podés
                      hacerlo desde la sección{" "}
                      <strong className="text-[var(--theme-text)]">
                        Configuración → Privacidad
                      </strong>{" "}
                      dentro del panel de administración.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── FAQ ── */}
            <section className="relative mx-auto max-w-4xl px-5 sm:px-8 pb-12 sm:pb-16">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--theme-text)] mb-8">
                Preguntas frecuentes
              </h2>
              <div className="space-y-4">
                {faqItems.map((item, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl border border-[var(--theme-border)] bg-white/50 overflow-hidden transition-all duration-200 open:shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 sm:p-6 text-sm sm:text-base font-bold text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/5 transition-colors list-none [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span className="shrink-0 text-[var(--theme-muted)] transition-transform duration-200 group-open:rotate-180">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm leading-relaxed text-[var(--theme-muted)] border-t border-[var(--theme-border)] pt-4">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* ── CONTACTO ── */}
            <section className="relative mx-auto max-w-4xl px-5 sm:px-8 pb-16 sm:pb-24">
              <div className="rounded-2xl border border-[var(--theme-border)] bg-white/70 p-6 sm:p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
                    <ExternalLink size={24} strokeWidth={1.8} />
                  </span>
                  <h2 className="text-xl font-bold text-[var(--theme-text)]">
                    ¿Tenés más dudas?
                  </h2>
                  <p className="text-sm leading-relaxed text-[var(--theme-muted)] max-w-lg">
                    Si querés más información sobre cómo manejamos tus datos,
                    consultá nuestra Política de Privacidad o escribinos.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <Link
                      href="/ayuda"
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--theme-border)] px-5 py-2.5 text-sm font-bold text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/5 transition-all"
                    >
                      Centro de Ayuda
                      <ExternalLink size={14} strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}
