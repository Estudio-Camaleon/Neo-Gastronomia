"use client";

import { useEffect, useState } from "react";
import { FoodLoading, FoodPulseRow } from "./food-loading";
import { motion } from "framer-motion";

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
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isVisible) return null;

  return (
    <div className="relative z-[9999]" role="dialog" aria-modal="true">
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
        <div className="relative bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/20 dark:shadow-black/40 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-7 flex flex-col items-center gap-5 min-w-[220px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent dark:from-emerald-400/5" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--neo-brand)] shadow-lg shadow-[var(--neo-brand)]/25"
          >
            <FoodLoading size={28} />
            <div className="absolute inset-0 animate-pulse rounded-xl bg-white/10" />
          </motion.div>

          <div className="relative flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <h2 className="text-sm font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                {message}
              </h2>
            </div>

            <FoodPulseRow count={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
