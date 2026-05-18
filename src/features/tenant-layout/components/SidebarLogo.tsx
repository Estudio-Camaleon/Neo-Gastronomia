"use client";
import { Zap } from "lucide-react";

export function SidebarLogo() {
  return (
    <div className="flex items-center gap-3 group px-2">
      <div className="relative">
        <div className="w-10 h-10 bg-[var(--admin-accent)] border-2 border-[var(--admin-border)] shadow-[3px_3px_0px_0px_var(--admin-border)] flex items-center justify-center transition-transform group-hover:scale-105">
          <Zap size={20} className="text-[var(--admin-bg)] fill-current" />
        </div>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
      </div>
      <div className="flex flex-col">
        <span className="font-black text-xl tracking-tighter uppercase italic leading-none text-[var(--admin-text)]">
          NEO <span className="text-[var(--admin-accent)]">SYSTEM</span>
        </span>
        <span className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-40">
          Control Unit
        </span>
      </div>
    </div>
  );
}
