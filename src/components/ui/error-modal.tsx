"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ErrorModalProps {
  title: string;
  message: string;
  action?: React.ReactNode;
  autoHideAfter?: number;
}

export function ErrorModal({
  title,
  message,
  action,
  autoHideAfter = 8,
}: ErrorModalProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!autoHideAfter) return;
    const timer = setTimeout(() => setVisible(false), autoHideAfter * 1000);
    return () => clearTimeout(timer);
  }, [autoHideAfter]);

  if (!visible) return null;

  return (
    <div className="flex items-center justify-center p-6 font-sans">
      <div className="relative max-w-md w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl shadow-xl text-center">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={24} strokeWidth={2} />
        </div>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {message}
        </p>

        {action && (
          <div className="w-full flex flex-col justify-center items-center gap-3 animate-in fade-in delay-75">
            {action}
          </div>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
          Esta ventana se cerrará automáticamente en {autoHideAfter} segundos
        </p>
      </div>
    </div>
  );
}
