"use client";

import { useEffect, useState } from "react";
import { FoodMini } from "./food-loading";
import { useScrollLock } from "@/core/hooks/useScrollLock";

interface LoadingOverlayProps {
  isActive: boolean;
  message?: string;
}

export function LoadingOverlay({
  isActive,
  message = "Cargando...",
}: LoadingOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  useScrollLock(isActive);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isVisible) return null;

  return (
    <div className="relative z-[999999]" role="dialog" aria-modal="true">
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
        <div className="bg-white dark:bg-zinc-900 shadow-xl border border-zinc-100 dark:border-zinc-800 rounded-2xl px-8 py-6 flex items-center gap-3 min-w-[180px]">
          <FoodMini size={16} />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
