import Link from "next/link";
import { Layers, ArrowUpRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Explorar",
      links: [
        { name: "Categorías", href: "#categories" },
        { name: "Destacados", href: "#featured" },
        { name: "Promociones", href: "#promotions" },
      ],
    },
    {
      title: "Cuenta",
      links: [
        { name: "Ingresar", href: "/login" },
        { name: "Crear local", href: "/registro" },
        { name: "Panel de gestión", href: "/login" },
      ],
    },
    {
      title: "Ayuda",
      links: [
        { name: "Soporte", href: "#" },
        { name: "Preguntas frecuentes", href: "#" },
        { name: "Contacto", href: "#" },
      ],
    },
  ];

  return (
    <footer className="w-full px-4 pb-8 pt-20 sm:px-6 lg:px-8 border-t border-[var(--theme-border)] mt-20">
      <div className="mx-auto max-w-7xl glass-card p-8 sm:p-12 grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Brand Column */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="neo-chip p-2 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-[var(--theme-text)]">
              NEO<span className="text-[var(--theme-primary)]">.</span>
            </span>
          </div>
          <p className="text-sm text-[var(--theme-text-muted)] max-w-sm leading-relaxed">
            Una experiencia pensada para descubrir restaurantes, promociones y
            menús con rapidez, claridad y estética premium.
          </p>
        </div>

        {/* Dynamic Nav Columns */}
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text)]">
              {section.title}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {section.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group text-sm font-medium text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] flex items-center gap-0.5 transition-colors duration-200"
                  >
                    {link.name}
                    {link.href.startsWith("http") && (
                      <ArrowUpRight className="w-3 h-3 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-primary)] transition-colors" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto max-w-7xl mt-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[var(--theme-text-muted)]">
        <p>&copy; {currentYear} NEO. Todos los derechos reservados.</p>
        <div className="flex items-center gap-2 border border-[var(--theme-border)] bg-[rgba(255,255,255,0.7)] px-3 py-1 rounded-full text-[var(--theme-text)]">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
          Home pública activa
        </div>
      </div>
    </footer>
  );
}
