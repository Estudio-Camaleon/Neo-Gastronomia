import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    // Eliminamos la clase neo-home de aquí para evitar conflictos de altura
    <footer className="py-16 md:py-24 px-6 relative border-t border-white/5 bg-[var(--theme-background)] w-full">
      {/* Glow decorativo sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent opacity-20"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Image
              src="/icons/neo_logo_blanco.svg"
              alt="NEO"
              width={30}
              height={30}
              className="h-auto w-auto"
            />
          </div>
          <p className="text-[var(--theme-text-muted)] max-w-sm text-sm leading-relaxed">
            La infraestructura digital definitiva para la gastronomía de alto
            rendimiento.
          </p>
        </div>

        <div>
          <h4 className="font-mono text-[10px] font-bold mb-6 uppercase tracking-[0.3em] text-[var(--theme-primary)]">
            // Navegación
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="#features"
                className="text-[var(--theme-text-muted)] hover:text-white transition-colors"
              >
                Capacidades
              </Link>
            </li>
            <li>
              <Link
                href="#precios"
                className="text-[var(--theme-text-muted)] hover:text-white transition-colors"
              >
                Planes
              </Link>
            </li>
            <li>
              <Link
                href="#testimonios"
                className="text-[var(--theme-text-muted)] hover:text-white transition-colors"
              >
                Social Proof
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[10px] font-bold mb-6 uppercase tracking-[0.3em] text-[var(--theme-primary)]">
            // Ecosistema
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="#"
                className="text-[var(--theme-text-muted)] hover:text-white transition-colors"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-[var(--theme-text-muted)] hover:text-white transition-colors"
              >
                Soporte
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--theme-text-muted)] opacity-50">
        <p>© 2026 NEO_LABS // Engine v2.4.0</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">
            Privacy_Policy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms_Service
          </a>
        </div>
      </div>
    </footer>
  );
}
