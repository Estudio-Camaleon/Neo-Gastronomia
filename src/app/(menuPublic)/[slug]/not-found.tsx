import React from "react";
import Link from "next/link";
import { Store } from "lucide-react";

export default function CatalogNotFound() {
  return (
    <div className="w-full min-h-screen bg-[#fcfbf9] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-24 h-24 bg-white rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] flex items-center justify-center mb-6 border border-neutral-100">
        <Store className="w-10 h-10 text-neutral-300" strokeWidth={1.5} aria-hidden="true" />
      </div>

      <h1 className="text-2xl font-extrabold text-neutral-900 mb-2 tracking-tight">
        Local no encontrado
      </h1>

      <p className="text-neutral-500 max-w-sm mb-8 text-[14px] leading-relaxed">
        El catálogo que estás buscando no existe, cambió su enlace o se
        encuentra temporalmente inactivo.
      </p>

      <Link
        href="/"
        className="bg-neutral-900 text-white px-6 py-2.5 rounded-full text-[13px] font-semibold hover:bg-neutral-800 active:scale-95 transition-all shadow-md"
      >
        Volver a NEO
      </Link>
    </div>
  );
}
