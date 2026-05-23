"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isActive: boolean;
  message?: string;
}

export function LoadingOverlay({
  isActive,
  message = "Cargando...",
}: LoadingOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
    } else {
      // Sincronizado con la duración de la transición Tailwind (300ms)
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isVisible) return null;

  return (
    <div
      className="relative z-[9999]"
      aria-labelledby="loading-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop Modern Minimalist: translúcido, sin depender de variables CSS */}
      <div
        className={`fixed inset-0 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isActive ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-0 flex flex-col items-center justify-center p-4 transition-all duration-300 ease-out ${
          isActive
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Contenedor central elegante */}
        <div className="bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/20 dark:shadow-black/40 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center gap-4 min-w-[200px]">
          <Loader2
            className="h-7 w-7 animate-spin text-zinc-900 dark:text-zinc-100"
            strokeWidth={2.5}
          />
          <h2
            id="loading-title"
            className="text-[13px] font-semibold tracking-tight text-zinc-700 dark:text-zinc-300"
          >
            {message}
          </h2>
        </div>
      </div>
    </div>
  );
}
