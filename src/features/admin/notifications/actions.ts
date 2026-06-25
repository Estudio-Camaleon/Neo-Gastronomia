"use server";

import { createClient } from "@/core/lib/supabase/server";
import { getAuthenticatedTenant } from "@/core/lib/tenant";
import { revalidatePath } from "next/cache";
import type { NotificationType } from "@/core/types/domain";

export async function fetchNotificationsAction() {
  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);
  if (!negocioId) return { error: "No autorizado" };

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("negocio_id", negocioId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { error: error.message };
  return { data };
}

export async function fetchUnreadCountAction() {
  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);
  if (!negocioId) return { count: 0 };

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("negocio_id", negocioId)
    .eq("read", false);

  return { count: count ?? 0 };
}

export async function markNotificationReadAction(notificationId: string) {
  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);
  if (!negocioId) return { error: "No autorizado" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("negocio_id", negocioId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);
  if (!negocioId) return { error: "No autorizado" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("negocio_id", negocioId)
    .eq("read", false);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function fetchNotificationPreferencesAction() {
  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);
  if (!negocioId) return { error: "No autorizado" };

  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("negocio_id", negocioId);

  if (error) return { error: error.message };
  return { data: data ?? [] };
}

export async function toggleNotificationPreferenceAction(
  notificationType: NotificationType,
  enabled: boolean,
) {
  const supabase = await createClient();
  const negocioId = await getAuthenticatedTenant(supabase);
  if (!negocioId) return { error: "No autorizado" };

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        negocio_id: negocioId,
        notification_type: notificationType,
        enabled,
      },
      { onConflict: "negocio_id, notification_type" },
    );

  if (error) return { error: error.message };
  revalidatePath("/configuracion");
  return { success: true };
}
