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
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isVisible) return null;

  return (
    <>
      {/* El bg-[var(--admin-bg)] garantiza que el overlay respete el tema sin JS */}
      <div
        className={`fixed inset-0 z-[9999] bg-[var(--admin-bg)]/90 backdrop-blur-md transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 transition-all duration-300 ${
          isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="relative">
          <Loader2
            className="h-16 w-16 animate-spin text-[var(--admin-accent)]"
            strokeWidth={2}
          />
        </div>
        <div className="mt-8 text-center">
          <h2 className="text-xl font-bold text-[var(--admin-text)]">
            {message}
          </h2>
        </div>
      </div>
    </>
  );
}
