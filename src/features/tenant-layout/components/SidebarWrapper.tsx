"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X} from "lucide-react";
import { usePathname } from "next/navigation";

interface SidebarWrapperProps {
  slug: string;
  negocioNombre: string;
  negocioId: string | null;
}

export function SidebarWrapper({
  slug,
  negocioNombre,
  negocioId,
}: SidebarWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Cerramos el menú móvil automáticamente cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* BOTÓN DISPARADOR (Solo visible en móvil < lg) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 right-4 z-[60] p-3 bg-[var(--admin-accent)] text-[var(--admin-bg)] border-2 border-[var(--admin-border)] shadow-[4px_4px_0px_0px_var(--admin-border)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <Menu size={20} strokeWidth={3} />
        </button>
      )}

      {/* OVERLAY TÉCNICO (Móvil) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#0f4023]/60 backdrop-blur-md z-[70] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* CONTENEDOR DEL SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[80] w-72 transform transition-transform duration-500 ease-in-out
          lg:translate-x-0 lg:static lg:inset-auto lg:h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header de Cierre Interno (Solo Móvil) */}
        <div className="lg:hidden absolute top-4 right-[-50px] z-[90]">
          <button
            onClick={() => setIsOpen(false)}
            className="p-3 bg-[var(--admin-border)] text-white border-2 border-[var(--admin-border)] shadow-[4px_4px_0px_0px_var(--admin-accent)]"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* El Sidebar Forest Tech */}
        <Sidebar
          slug={slug}
          negocioNombre={negocioNombre}
          negocioId={negocioId}
        />
      </aside>
    </>
  );
}
