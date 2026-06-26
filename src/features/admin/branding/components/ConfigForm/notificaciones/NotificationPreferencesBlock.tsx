"use client";

import { useState, useEffect } from "react";
import { Bell, Info } from "lucide-react";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_DESCRIPTIONS,
} from "@/core/types/domain";
import type { NotificationType } from "@/core/types/domain";
import { fetchNotificationPreferencesAction, toggleNotificationPreferenceAction } from "@/features/admin/notifications/actions";
import { FoodMini } from "@/components/ui/food-loading";
import { toast } from "sonner";

export function NotificationPreferencesBlock() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetchNotificationPreferencesAction();
      if (res.data) {
        const map: Record<string, boolean> = {};
        for (const p of res.data) {
          map[p.notification_type] = p.enabled;
        }
        for (const t of NOTIFICATION_TYPES) {
          if (map[t] === undefined) map[t] = true;
        }
        setPrefs(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleToggle = async (type: NotificationType) => {
    setToggling(type);
    const newVal = !prefs[type];
    setPrefs((prev) => ({ ...prev, [type]: newVal }));
    const res = await toggleNotificationPreferenceAction(type, newVal);
    if (res.error) {
      setPrefs((prev) => ({ ...prev, [type]: !newVal }));
      toast.error(res.error);
    }
    setToggling(null);
  };

  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
        <Bell size={14} className="text-[var(--admin-text-muted)]" />
        <h2 className="text-xs font-semibold text-[var(--admin-text)]">
          Notificaciones del Sistema
        </h2>
      </div>

      <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-2.5 flex gap-2 items-start">
        <Info size={12} className="shrink-0 text-[var(--admin-text-muted)] mt-0.5" />
        <p className="text-[10px] text-[var(--admin-text-muted)] leading-normal">
          Activá o desactivá qué tipo de notificaciones querés recibir en el panel.
          Los cambios se guardan automáticamente.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <FoodMini size={16} />
        </div>
      ) : (
        <div className="space-y-3">
          {NOTIFICATION_TYPES.map((type) => (
            <div
              key={type}
              className="flex items-center justify-between gap-4 p-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)]"
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-[var(--admin-text)] block">
                  {NOTIFICATION_TYPE_LABELS[type]}
                </span>
                <span className="text-[10px] text-[var(--admin-text-muted)] block mt-0.5">
                  {NOTIFICATION_TYPE_DESCRIPTIONS[type]}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[type] ?? true}
                disabled={toggling === type}
                onClick={() => handleToggle(type)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 outline-none disabled:opacity-50 ${
                  (prefs[type] ?? true)
                    ? "bg-[var(--admin-accent)]"
                    : "bg-[var(--admin-text-muted)]/30"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-150 ${
                    (prefs[type] ?? true) ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
