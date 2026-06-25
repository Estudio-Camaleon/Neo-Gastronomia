"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/core/lib/supabase/client";
import { toast } from "sonner";
import { BellDot } from "lucide-react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { NotificationData } from "@/core/types/domain";

interface NotificationContextValue {
  unreadCount: number;
  notifications: NotificationData[];
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  notifications: [],
  markRead: async () => {},
  markAllRead: async () => {},
  loading: true,
});

export function useNotifications() {
  return useContext(NotificationContext);
}

interface NotificationProviderProps {
  negocioId: string;
  children: ReactNode;
}

export function NotificationProvider({
  negocioId,
  children,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    const supabase = supabaseRef.current;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("negocio_id", negocioId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data as unknown as NotificationData[]);
    }
    setLoading(false);
  }, [negocioId]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`notifications-${negocioId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `negocio_id=eq.${negocioId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const newNotif = payload.new as unknown as NotificationData;
          if (!newNotif?.id) return;

          setNotifications((prev) => [newNotif, ...prev]);

          toast.info(newNotif.title, {
            icon: <BellDot className="text-blue-500 animate-pulse" />,
            description: newNotif.body ?? undefined,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [negocioId]);

  const markRead = useCallback(async (id: string) => {
    const supabase = supabaseRef.current;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(async () => {
    const supabase = supabaseRef.current;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("negocio_id", negocioId)
      .eq("read", false);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true })),
    );
  }, [negocioId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ unreadCount, notifications, markRead, markAllRead, loading }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
