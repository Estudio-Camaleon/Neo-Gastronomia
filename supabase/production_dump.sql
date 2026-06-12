-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.estado_pedido AS ENUM ('pendiente', 'en_preparacion', 'entregado', 'cancelado');
CREATE TYPE public.team_role AS ENUM ('admin', 'staff', 'viewer');

-- ============================================================
-- TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.negocios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  banner_url TEXT,
  descripcion TEXT,
  direccion TEXT,
  telefono TEXT,
  whatsapp TEXT,
  instagram TEXT,
  facebook TEXT,
  website TEXT,
  horario_apertura TIME,
  horario_cierre TIME,
  color_primario TEXT DEFAULT '#f97316',
  color_secundario TEXT DEFAULT '#1e293b',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  configuracion JSONB DEFAULT '{}'::jsonb,
  onboarding_completado BOOLEAN DEFAULT false,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'basic', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'incomplete' CHECK (subscription_status IN ('incomplete', 'active', 'past_due', 'canceled', 'unpaid')),
  trial_ends_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  slug TEXT,
  icono TEXT
);
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC NOT NULL,
  imagen_url TEXT,
  disponible BOOLEAN DEFAULT true,
  configuracion JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  total NUMERIC NOT NULL,
  estado public.estado_pedido DEFAULT 'pendiente',
  metodo_pago TEXT,
  es_delivery BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  cliente_nombre TEXT,
  cliente_whatsapp TEXT,
  direccion_entrega TEXT,
  notas TEXT
);
CREATE TABLE IF NOT EXISTS public.pedido_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  nombre_producto TEXT NOT NULL,
  precio_unitario NUMERIC NOT NULL,
  cantidad INTEGER NOT NULL,
  detalles TEXT
);
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.team_role DEFAULT 'staff',
  invited_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(negocio_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT now(),
  UNIQUE(identifier, action)
);
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_negocios_slug ON public.negocios(slug);
CREATE INDEX IF NOT EXISTS idx_negocios_user_id ON public.negocios(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_negocio_id ON public.pedidos(negocio_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_productos_negocio_id ON public.productos(negocio_id);
CREATE INDEX IF NOT EXISTS idx_clientes_negocio_id ON public.clientes(negocio_id);
CREATE INDEX IF NOT EXISTS idx_categorias_negocio_id ON public.categorias(negocio_id);

-- ============================================================
-- REPLICA IDENTITY (for Realtime)
-- ============================================================
ALTER TABLE public.pedidos REPLICA IDENTITY FULL;
ALTER TABLE public.pedido_items REPLICA IDENTITY FULL;

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: usuario_accede_negocio
CREATE OR REPLACE FUNCTION public.usuario_accede_negocio(p_negocio_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (SELECT 1 FROM public.negocios WHERE id = p_negocio_id AND user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.team_members WHERE negocio_id = p_negocio_id AND user_id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS: negocios
DROP POLICY IF EXISTS "Usuarios pueden ver su propio negocio" ON public.negocios;
CREATE POLICY "Usuarios pueden ver su propio negocio" ON public.negocios
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio negocio" ON public.negocios;
CREATE POLICY "Usuarios pueden actualizar su propio negocio" ON public.negocios
  FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Cualquiera puede ver negocios activos" ON public.negocios;
CREATE POLICY "Cualquiera puede ver negocios activos" ON public.negocios
  FOR SELECT USING (true);
-- RLS: categorias (owner + team)
DROP POLICY IF EXISTS "Owner y team pueden ver categorias" ON public.categorias;
CREATE POLICY "Owner y team pueden ver categorias" ON public.categorias
  FOR SELECT USING (usuario_accede_negocio(negocio_id));
DROP POLICY IF EXISTS "Owner y team pueden insertar categorias" ON public.categorias;
CREATE POLICY "Owner y team pueden insertar categorias" ON public.categorias
  FOR INSERT WITH CHECK (usuario_accede_negocio(negocio_id));
DROP POLICY IF EXISTS "Owner y team pueden actualizar categorias" ON public.categorias;
CREATE POLICY "Owner y team pueden actualizar categorias" ON public.categorias
  FOR UPDATE USING (usuario_accede_negocio(negocio_id));
DROP POLICY IF EXISTS "Owner y team pueden eliminar categorias" ON public.categorias;
CREATE POLICY "Owner y team pueden eliminar categorias" ON public.categorias
  FOR DELETE USING (usuario_accede_negocio(negocio_id));
-- RLS: productos (owner + team)
DROP POLICY IF EXISTS "Owner y team pueden ver productos" ON public.productos;
CREATE POLICY "Owner y team pueden ver productos" ON public.productos
  FOR SELECT USING (usuario_accede_negocio(negocio_id));
DROP POLICY IF EXISTS "Owner y team pueden insertar productos" ON public.productos;
CREATE POLICY "Owner y team pueden insertar productos" ON public.productos
  FOR INSERT WITH CHECK (usuario_accede_negocio(negocio_id));
DROP POLICY IF EXISTS "Owner y team pueden actualizar productos" ON public.productos;
CREATE POLICY "Owner y team pueden actualizar productos" ON public.productos
  FOR UPDATE USING (usuario_accede_negocio(negocio_id));
DROP POLICY IF EXISTS "Owner y team pueden eliminar productos" ON public.productos;
CREATE POLICY "Owner y team pueden eliminar productos" ON public.productos
  FOR DELETE USING (usuario_accede_negocio(negocio_id));
-- RLS: clientes (owner + team)
DROP POLICY IF EXISTS "Owner y team pueden ver clientes" ON public.clientes;
CREATE POLICY "Owner y team pueden ver clientes" ON public.clientes
  FOR SELECT USING (usuario_accede_negocio(negocio_id));
DROP POLICY IF EXISTS "Owner y team pueden insertar clientes" ON public.clientes;
CREATE POLICY "Owner y team pueden insertar clientes" ON public.clientes
  FOR INSERT WITH CHECK (usuario_accede_negocio(negocio_id));
DROP POLICY IF EXISTS "Owner y team pueden actualizar clientes" ON public.clientes;
CREATE POLICY "Owner y team pueden actualizar clientes" ON public.clientes
  FOR UPDATE USING (usuario_accede_negocio(negocio_id));
-- RLS: pedidos (owner + team)
DROP POLICY IF EXISTS "Owner y team pueden ver pedidos" ON public.pedidos;
CREATE POLICY "Owner y team pueden ver pedidos" ON public.pedidos
  FOR SELECT USING (usuario_accede_negocio(negocio_id));
DROP POLICY IF EXISTS "Owner y team pueden actualizar pedidos" ON public.pedidos;
CREATE POLICY "Owner y team pueden actualizar pedidos" ON public.pedidos
  FOR UPDATE USING (usuario_accede_negocio(negocio_id));
DROP POLICY IF EXISTS "Publico puede insertar pedidos" ON public.pedidos;
CREATE POLICY "Publico puede insertar pedidos" ON public.pedidos
  FOR INSERT WITH CHECK (true);
-- RLS: pedido_items (owner + team)
DROP POLICY IF EXISTS "Owner y team pueden ver items" ON public.pedido_items;
CREATE POLICY "Owner y team pueden ver items" ON public.pedido_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.pedidos WHERE id = pedido_id AND usuario_accede_negocio(negocio_id)));
DROP POLICY IF EXISTS "Publico puede insertar items" ON public.pedido_items;
CREATE POLICY "Publico puede insertar items" ON public.pedido_items
  FOR INSERT WITH CHECK (true);
-- RLS: team_members
DROP POLICY IF EXISTS "Owner y team pueden ver miembros" ON public.team_members;
CREATE POLICY "Owner y team pueden ver miembros" ON public.team_members
  FOR SELECT USING (usuario_accede_negocio(negocio_id));
DROP POLICY IF EXISTS "Owner puede insertar miembros" ON public.team_members;
CREATE POLICY "Owner puede insertar miembros" ON public.team_members
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.negocios WHERE id = negocio_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "Owner puede actualizar miembros" ON public.team_members;
CREATE POLICY "Owner puede actualizar miembros" ON public.team_members
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.negocios WHERE id = negocio_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "Owner puede eliminar miembros" ON public.team_members;
CREATE POLICY "Owner puede eliminar miembros" ON public.team_members
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.negocios WHERE id = negocio_id AND user_id = auth.uid()));

-- ============================================================
-- FUNCTIONS / RPCs
-- ============================================================
CREATE OR REPLACE FUNCTION public.eliminar_negocio_completo(p_negocio_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM public.pedido_items WHERE pedido_id IN (SELECT id FROM public.pedidos WHERE negocio_id = p_negocio_id);
  DELETE FROM public.pedidos WHERE negocio_id = p_negocio_id;
  DELETE FROM public.productos WHERE negocio_id = p_negocio_id;
  DELETE FROM public.categorias WHERE negocio_id = p_negocio_id;
  DELETE FROM public.clientes WHERE negocio_id = p_negocio_id;
  DELETE FROM public.team_members WHERE negocio_id = p_negocio_id;
  DELETE FROM public.audit_logs WHERE negocio_id = p_negocio_id;
  DELETE FROM public.negocios WHERE id = p_negocio_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;

CREATE OR REPLACE FUNCTION public.eliminar_usuario_completo(p_user_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM public.eliminar_negocio_completo(id) FROM public.negocios WHERE user_id = p_user_id;
  DELETE FROM public.team_members WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;

CREATE OR REPLACE FUNCTION public.listar_negocios_usuario(p_email TEXT)
RETURNS TABLE(negocio_id UUID, negocio_nombre TEXT, user_id UUID, user_email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.nombre, n.user_id, p_email
  FROM public.negocios n
  WHERE n.user_id = (SELECT id FROM auth.users WHERE email = p_email LIMIT 1)
  UNION ALL
  SELECT tm.negocio_id, n.nombre, tm.user_id, p_email
  FROM public.team_members tm
  JOIN public.negocios n ON n.id = tm.negocio_id
  WHERE tm.user_id = (SELECT id FROM auth.users WHERE email = p_email LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_negocios_updated_at ON public.negocios;
CREATE TRIGGER trg_negocios_updated_at
  BEFORE UPDATE ON public.negocios
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_updated_at();

SELECT 'Schema dump complete.' AS status;