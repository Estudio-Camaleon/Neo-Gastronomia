"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";

export function SidebarWrapper({
  slug,
  negocioNombre,
}: {
  slug: string;
  negocioNombre: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* BOTÓN HAMBURGUESA (Solo móvil) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-40 p-2 bg-primary text-white rounded-neo border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      >
        <Menu size={20} />
      </button>

      {/* OVERLAY (Cierra al tocar fuera) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-bg-dark/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ASIDE: El Sidebar Real */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out bg-surface dark:bg-surface-dark border-r-4 border-black
        lg:translate-x-0 lg:static lg:inset-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Botón de cerrar interno para móvil */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 border-2 border-black rounded-md"
        >
          <X size={18} />
        </button>

        <Sidebar slug={slug} negocioNombre={negocioNombre} />
      </aside>
    </>
  );
}
