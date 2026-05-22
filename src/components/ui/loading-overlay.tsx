"use client";

import { LoaderCircle } from "lucide-react";

type LoadingOverlayProps = {
  isActive: boolean;
  message?: string;
};

export function LoadingOverlay({ isActive, message = "Cargando..." }: LoadingOverlayProps) {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 px-6 backdrop-blur-md">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,12,12,0.92),rgba(28,28,28,0.88))] px-8 py-7 text-center text-white shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <div className="rounded-full border border-white/10 bg-white/5 p-4 text-[var(--theme-primary)]">
          <LoaderCircle className="h-10 w-10 animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-white/45">NEO</p>
          <p className="text-lg font-black uppercase tracking-tight">{message}</p>
        </div>
      </div>
    </div>
  );
}