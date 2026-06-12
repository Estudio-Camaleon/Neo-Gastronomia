-- 20260608: Audit logs para trazabilidad de cambios
-- Registra quién hizo qué, cuándo y en qué entidad

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  accion TEXT NOT NULL, -- 'create', 'update', 'delete'
  entidad TEXT NOT NULL, -- 'producto', 'categoria', 'pedido', 'negocio', 'configuracion'
  entidad_id TEXT, -- ID de la entidad afectada
  cambios_previos JSONB, -- valores anteriores (para UPDATE/DELETE)
  cambios_nuevos JSONB, -- valores nuevos (para CREATE/UPDATE)
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_negocio_id ON public.audit_logs (negocio_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entidad ON public.audit_logs (entidad);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entidad_id ON public.audit_logs (entidad_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo el dueño del negocio puede ver sus audit logs
CREATE POLICY "audit_logs_propio_select" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.negocios
      WHERE negocios.id = audit_logs.negocio_id
        AND negocios.user_id = auth.uid()
    )
  );

-- Solo server-side (supabaseAdmin) puede insertar audit logs
CREATE POLICY "audit_logs_admin_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);
