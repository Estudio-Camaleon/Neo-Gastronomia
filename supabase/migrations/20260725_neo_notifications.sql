-- Migration: Notification system
-- Date: 2026-07-25
-- 1. Tipos de notificación disponibles
-- 2. Tabla de preferencias (por negocio, qué tipos de notif están habilitados)
-- 3. Tabla de notificaciones en sí

-- ── Tipos de notificación ──
-- Se almacenan como TEXT con estos valores:
-- new_order      → Nuevo pedido entrante
-- order_update   → Cambio de estado en un pedido
-- system         → Aviso del sistema (ej: actualización, mantenimiento)
-- promo_ending   → Promoción por vencer
-- stock_alert    → Producto con stock bajo

-- ── Preferencias de notificación por negocio ──
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_notification_pref UNIQUE (negocio_id, notification_type)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Owner puede ver sus propias preferencias
CREATE POLICY "notification_preferences_owner_select"
  ON notification_preferences
  FOR SELECT
  USING (negocio_id IN (
    SELECT id FROM public.negocios WHERE user_id = auth.uid()
  ));

-- Owner puede insertar/actualizar sus preferencias
CREATE POLICY "notification_preferences_owner_insert"
  ON notification_preferences
  FOR INSERT
  WITH CHECK (negocio_id IN (
    SELECT id FROM public.negocios WHERE user_id = auth.uid()
  ));

CREATE POLICY "notification_preferences_owner_update"
  ON notification_preferences
  FOR UPDATE
  USING (negocio_id IN (
    SELECT id FROM public.negocios WHERE user_id = auth.uid()
  ));

-- staff puede leer
CREATE POLICY "notification_preferences_staff_select"
  ON notification_preferences
  FOR SELECT
  USING (negocio_id IN (
    SELECT negocio_id FROM public.team_members WHERE user_id = auth.uid()
  ));

-- ── Notificaciones ──
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_negocio
  ON public.notifications (negocio_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications (negocio_id, read)
  WHERE read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Solo lectura para owner y staff (las inserts van por service_role)
CREATE POLICY "notifications_select_owner"
  ON public.notifications
  FOR SELECT
  USING (negocio_id IN (
    SELECT id FROM public.negocios WHERE user_id = auth.uid()
  ));

CREATE POLICY "notifications_select_staff"
  ON public.notifications
  FOR SELECT
  USING (negocio_id IN (
    SELECT negocio_id FROM public.team_members WHERE user_id = auth.uid()
  ));

-- Update (marcar como leída)
CREATE POLICY "notifications_update_owner"
  ON public.notifications
  FOR UPDATE
  USING (negocio_id IN (
    SELECT id FROM public.negocios WHERE user_id = auth.uid()
  ));

CREATE POLICY "notifications_update_staff"
  ON public.notifications
  FOR UPDATE
  USING (negocio_id IN (
    SELECT negocio_id FROM public.team_members WHERE user_id = auth.uid()
  ));
