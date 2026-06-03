"use client"; // Los Error Boundaries siempre deben ser Client Components

import { useEffect } from "react";
import { AlertOctagon, RefreshCcw } from "lucide-react";

export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí podrías enviar el error a Sentry o a Supabase Logs en un futuro
    console.error("[NEO SYSTEM] Critical Error in Catalog:", error);
  }, [error]);

  return (
    <div className="w-full min-h-screen bg-[#fcfbf9] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100/50">
        <AlertOctagon className="w-10 h-10 text-red-500" strokeWidth={1.5} aria-hidden="true" />
      </div>

      <h1 className="text-2xl font-extrabold text-neutral-900 mb-2 tracking-tight">
        Algo salió mal
      </h1>

      <p className="text-neutral-500 max-w-sm mb-8 text-[14px] leading-relaxed">
        Tuvimos un problema de conexión al cargar el menú de este local. Por
        favor, intenta de nuevo.
      </p>

      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 rounded-full text-[13px] font-semibold hover:bg-neutral-800 active:scale-95 transition-all shadow-md"
      >
        <RefreshCcw size={16} aria-hidden="true" />
        Reintentar conexión
      </button>
    </div>
  );
}
