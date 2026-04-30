"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita errores de hidratación: el componente solo se renderiza en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-surface-dark/5 border border-border/50" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="group relative w-10 h-10 flex items-center justify-center rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:border-primary/50 transition-all duration-300 active:scale-90 shadow-sm"
      aria-label="Cambiar tema"
    >
      {/* Icono de Sol */}
      <span
        className={`absolute transition-all duration-500 transform ${
          theme === "dark"
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 rotate-90 opacity-0"
        }`}
      >
        ☀️
      </span>

      {/* Icono de Luna */}
      <span
        className={`absolute transition-all duration-500 transform ${
          theme === "dark"
            ? "scale-0 -rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100"
        }`}
      >
        🌙
      </span>

      {/* Efecto de brillo al hover */}
      <div className="absolute inset-0 rounded-xl bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
    </button>
  );
}
