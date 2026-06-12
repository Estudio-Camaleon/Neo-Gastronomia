"use client";

import { Menu } from "lucide-react";

interface AdminHamburgerButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  controls?: string;
  className?: string;
}

export function AdminHamburgerButton({
  onClick,
  isOpen = false,
  controls = "mobile-sidebar-panel",
  className = "",
}: AdminHamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      aria-expanded={isOpen}
      aria-controls={controls}
      className={`touch-target flex items-center justify-center p-2.5 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] rounded-xl hover:bg-[var(--admin-accent)]/20 transition-all duration-200 cursor-pointer outline-none active:scale-90 border border-[var(--admin-accent)]/20 ${className}`}
    >
      <Menu size={22} />
    </button>
  );
}
