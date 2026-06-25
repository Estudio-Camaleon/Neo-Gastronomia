"use client";

import { useNotifications } from "./NotificationProvider";
import {
  Bell,
  CheckCheck,
  Clock,
  ShoppingBag,
  RefreshCw,
  AlertTriangle,
  Package,
  Megaphone,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { NotificationType, NotificationData } from "@/core/types/domain";
import { FoodMini } from "@/components/ui/food-loading";

const ICON_MAP: Record<NotificationType, React.ReactNode> = {
  new_order: <ShoppingBag size={14} />,
  order_update: <RefreshCw size={14} />,
  system: <AlertTriangle size={14} />,
  promo_ending: <Megaphone size={14} />,
  stock_alert: <Package size={14} />,
};

const COLOR_MAP: Record<NotificationType, string> = {
  new_order: "text-blue-400",
  order_update: "text-amber-400",
  system: "text-red-400",
  promo_ending: "text-purple-400",
  stock_alert: "text-orange-400",
};

function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: es,
    });
  } catch {
    return "";
  }
}

interface NotificationTrayProps {
  onClose: () => void;
  variant?: "sidebar" | "header";
}

export function NotificationTray({ onClose, variant }: NotificationTrayProps) {
  const { notifications, markRead, markAllRead, loading } = useNotifications();
  const unread = notifications.filter((n) => !n.read);

  const positionClasses =
    variant === "sidebar"
      ? "left-1/2 -translate-x-1/2 bottom-full mb-2"
      : "fixed left-1/2 -translate-x-1/2 top-16 z-[100] sm:absolute sm:right-0 sm:left-auto sm:translate-x-0 sm:top-full sm:mt-1";

  const widthClasses =
    variant === "sidebar"
      ? "w-80"
      : "w-[calc(100vw-1.5rem)] sm:w-80 md:w-96";

  return (
    <div
      className={`absolute z-[100] ${widthClasses} ${positionClasses}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-[var(--admin-text-muted)]" />
            <span className="text-xs font-bold text-[var(--admin-text)]">
              Notificaciones
            </span>
            {unread.length > 0 && (
              <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unread.length}
              </span>
            )}
          </div>
          {unread.length > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-[10px] font-semibold text-[var(--admin-accent)] hover:underline flex items-center gap-1"
            >
              <CheckCheck size={12} />
              Leer todas
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FoodMini size={16} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-[var(--admin-text-muted)]">
              <Bell size={24} className="opacity-30 mb-2" />
              <p className="text-xs font-medium">Sin notificaciones</p>
              <p className="text-[10px] opacity-60 mt-0.5">
                Las novedades aparecerán acá
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--admin-border)]">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    if (!n.read) markRead(n.id);
                  }}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-[var(--admin-bg)]/50 ${
                    !n.read ? "bg-[var(--admin-accent)]/5" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`shrink-0 mt-0.5 ${
                        COLOR_MAP[n.type as NotificationType] ?? "text-[var(--admin-text-muted)]"
                      }`}
                    >
                      {ICON_MAP[n.type as NotificationType] ?? (
                        <Bell size={14} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-xs ${
                            !n.read
                              ? "font-bold text-[var(--admin-text)]"
                              : "font-medium text-[var(--admin-text-muted)]"
                          }`}
                        >
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--admin-accent)] mt-1" />
                        )}
                      </div>
                      {n.body && (
                        <p className="text-[10px] text-[var(--admin-text-muted)] mt-0.5 line-clamp-2 leading-relaxed">
                          {n.body}
                        </p>
                      )}
                      <span className="text-[9px] text-[var(--admin-text-muted)]/50 mt-1 flex items-center gap-1">
                        <Clock size={9} />
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
