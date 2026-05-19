"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isActive: boolean;
  message?: string;
  variant?: "dark" | "light";
}

export function LoadingOverlay({ 
  isActive, 
  message = "Cargando...", 
  variant = "dark" 
}: LoadingOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  const isDark = variant === "dark";
  const bgClass = isDark ? "bg-black/95" : "bg-white/95";
  const accentColor = isDark ? "#A3FF00" : "#000000";
  const textColor = isDark ? "text-white" : "text-black";
  const textMutedColor = isDark ? "text-[#A3FF00]/70" : "text-black/50";
  const borderColor = isDark ? "border-[#A3FF00]" : "border-black";
  const lineColor = isDark ? "via-[#A3FF00]" : "via-black";

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
      {/* Backdrop cinematográfico */}
      <div
        className={`fixed inset-0 z-[9999] ${bgClass} backdrop-blur-sm transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Contenedor central */}
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 transition-all duration-300 ${
          isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Spinner principal enormous */}
        <div className="relative">
          {/* Anillo externo pulsante */}
          <div 
            className={`absolute inset-0 rounded-full border-4 ${borderColor} opacity-20 animate-pulse`}
          />

          {/* Anillo rotativo */}
          <div 
            className={`absolute inset-0 rounded-full border-4 border-transparent animate-spin`}
            style={{
              borderTopColor: accentColor,
              borderRightColor: accentColor,
            }}
          />

          {/* Spinner interior */}
          <div className="relative h-32 w-32 flex items-center justify-center">
            <Loader2 
              className={`h-20 w-20 animate-spin`}
              stroke={accentColor}
              strokeWidth={2} 
            />
          </div>
        </div>

        {/* Mensaje de estado */}
        <div className="mt-8 text-center space-y-3">
          <h2 className={`text-2xl font-black uppercase tracking-wider ${textColor} italic`}>
            {message}
          </h2>
          <p className={`text-xs font-mono uppercase tracking-[0.2em] ${textMutedColor}`}>
            Procesando tu solicitud...
          </p>
        </div>

        {/* Línea de progreso animada */}
        <div className={`mt-12 w-32 h-1 rounded-full overflow-hidden border ${isDark ? "bg-white/10 border-[#A3FF00]/30" : "bg-black/10 border-black/30"}`}>
          <div
            className={`h-full bg-gradient-to-r from-transparent to-transparent animate-pulse`}
            style={{
              backgroundImage: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
              animation: "shimmer 2s infinite",
            }}
          />
        </div>

        {/* Texto pequeño de referencia */}
        <div className="mt-8 text-center">
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white/40" : "text-black/40"}`}>
            NEO<span style={{ color: accentColor }}>.</span>SYSTEM
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
