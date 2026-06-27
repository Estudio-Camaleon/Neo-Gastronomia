"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, BellRing } from "lucide-react";
import { useNotifications } from "./NotificationProvider";
import { NotificationTray } from "./NotificationTray";
import { useUrgentStore } from "@/features/admin/orders/urgent-store";

interface NotificationBellProps {
  variant?: "sidebar" | "header";
}

export function NotificationBell({ variant = "header" }: NotificationBellProps) {
  const { unreadCount } = useNotifications();
  const urgentCount = useUrgentStore((s) => s.urgentCount);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hasUrgent = urgentCount > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const isSidebar = variant === "sidebar";
  const Icon = hasUrgent ? BellRing : Bell;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}${hasUrgent ? " — Pedidos retrasados" : ""}`}

        className={`touch-target flex items-center justify-center rounded-lg transition-all active:scale-90 ${
          isSidebar
            ? "w-10 h-10 mx-auto text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-accent)]/5"
            : "w-10 h-10 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)]"
        } ${hasUrgent ? "animate-[shake_0.5s_ease-in-out_infinite] text-red-500" : ""}`}
      >
        <div className="relative">
          <Icon size={isSidebar ? 18 : 16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {hasUrgent && (
            <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          )}
        </div>
      </button>

      {open && (
        <NotificationTray
          onClose={() => setOpen(false)}
          variant={variant}
        />
      )}
    </div>
  );
}
