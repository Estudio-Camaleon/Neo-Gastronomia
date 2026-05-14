"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-12 h-12 border-4 border-black dark:border-white bg-muted animate-pulse" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`
        relative w-12 h-12 flex items-center justify-center 
        border-4 transition-all duration-100
        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
        ${
          theme === "dark"
            ? "bg-white border-white text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.4)]"
            : "bg-[#A3FF00] border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        }
      `}
      aria-label="Alternar Protocolo de Iluminación"
    >
      <div className="relative w-6 h-6">
        <Sun
          className={`absolute inset-0 transition-all duration-500 transform ${
            theme === "dark"
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 rotate-90 opacity-0"
          }`}
        />
        <Moon
          className={`absolute inset-0 transition-all duration-500 transform ${
            theme === "dark"
              ? "scale-0 -rotate-90 opacity-0"
              : "scale-100 rotate-0 opacity-100"
          }`}
        />
      </div>

      {/* Marca técnica de esquina: Indica "ON" en modo oscuro */}
      <div
        className={`absolute -top-1 -right-1 w-3 h-3 border-2 border-black transition-colors ${
          theme === "dark" ? "bg-[#A3FF00]" : "bg-red-500"
        }`}
      />
    </button>
  );
}
