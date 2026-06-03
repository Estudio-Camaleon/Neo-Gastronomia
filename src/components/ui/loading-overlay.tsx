"use client";

import { useEffect, useState } from "react";

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

          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/25">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <div className="absolute inset-0 animate-pulse rounded-xl bg-white/20" />
          </div>

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

            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400/60 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
