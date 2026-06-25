"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "./NotificationProvider";
import { NotificationTray } from "./NotificationTray";

interface NotificationBellProps {
  variant?: "sidebar" | "header";
}

export function NotificationBell({ variant = "header" }: NotificationBellProps) {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
        className={`touch-target flex items-center justify-center rounded-lg transition-all active:scale-90 ${
          isSidebar
            ? "w-10 h-10 mx-auto text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-accent)]/5"
            : "w-10 h-10 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)]"
        }`}
      >
        <div className="relative">
          <Bell size={isSidebar ? 18 : 16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
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
