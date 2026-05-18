import Link from "next/link";
import { Layers, ArrowUpRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Producto",
      links: [
        { name: "Características", href: "#features" },
        { name: "Precios", href: "#pricing" },
        { name: "Menú Demo", href: "/demo" },
      ],
    },
    {
      title: "SaaS Engine",
      links: [
        { name: "Admin Portal", href: "/login" },
        { name: "Suscripciones", href: "#" },
        { name: "Seguridad RLS", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Términos", href: "#" },
        { name: "Privacidad", href: "#" },
      ],
    },
  ];

  return (
    <footer className="w-full px-4 pb-8 pt-20 sm:px-6 lg:px-8 border-t border-[rgba(95,131,16,0.1)] mt-20">
      <div className="mx-auto max-w-7xl glass-card p-8 sm:p-12 grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Brand Column */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#1f2212] border border-[rgba(95,131,16,0.3)] p-2 rounded-xl text-[#9db71c]">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-white">
              NEO<span className="text-[#9db71c]">.</span>
            </span>
          </div>
          <p className="text-sm text-[#748c58] max-w-sm leading-relaxed">
            Infraestructura gastronómica multi-tenant en la nube. Menús
            digitales ultra-rápidos que optimizan la conversión y automatizan
            tus pedidos a WhatsApp.
          </p>
        </div>

        {/* Dynamic Nav Columns */}
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {section.title}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {section.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group text-sm font-medium text-[#748c58] hover:text-white flex items-center gap-0.5 transition-colors duration-200"
                  >
                    {link.name}
                    {link.href.startsWith("http") && (
                      <ArrowUpRight className="w-3 h-3 text-[#748c58] group-hover:text-white transition-colors" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto max-w-7xl mt-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#748c58]">
        <p>&copy; {currentYear} NEO System. Todos los derechos reservados.</p>
        <div className="flex items-center gap-2 border border-[rgba(95,131,16,0.15)] bg-[rgba(31,34,18,0.2)] px-3 py-1 rounded-full text-white">
          <span className="inline-block w-2 h-2 rounded-full bg-[#9db71c] animate-pulse" />
          Production Mode v3.0
        </div>
      </div>
    </footer>
  );
}
