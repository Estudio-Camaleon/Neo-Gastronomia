-- ============================================================
-- NEO DB CLEANUP & ENFORCEMENT MIGRATION
-- ============================================================
-- 1. Crear enum para estado de pedido
-- 2. Agregar constraint CHECK a pedidos.estado
-- 3. Eliminar tablas no utilizadas (producto_opciones_grupos, producto_opciones_items)
-- 4. Agregar índices para performance
-- 5. Sugerencias de RLS policies
-- ============================================================

-- 1. ENUM para estado de pedido
DO $$ BEGIN
  CREATE TYPE estado_pedido AS ENUM ('pendiente', 'en_preparacion', 'entregado', 'cancelado');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Migrar columna existente al nuevo tipo
ALTER TABLE public.pedidos
  ALTER COLUMN estado DROP DEFAULT,
  ALTER COLUMN estado TYPE estado_pedido
    USING (COALESCE(estado, 'pendiente')::estado_pedido),
  ALTER COLUMN estado SET DEFAULT 'pendiente'::estado_pedido,
  ALTER COLUMN estado SET NOT NULL;

-- 2. Eliminar tablas no utilizadas (opciones guardadas en JSONB dentro de productos.configuracion)
DROP TABLE IF EXISTS public.producto_opciones_items CASCADE;
DROP TABLE IF EXISTS public.producto_opciones_grupos CASCADE;

-- 3. ÍNDICES para performance
-- negocio_id en pedidos (usado en TODAS las queries de pedidos)
CREATE INDEX IF NOT EXISTS idx_pedidos_negocio_id ON public.pedidos (negocio_id);
-- created_at para ordenamiento y filtros por fecha
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos (created_at DESC);
-- estado para filtros rápidos
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos (estado);
-- user_id en negocios (usado en autenticación multi-tenant)
CREATE INDEX IF NOT EXISTS idx_negocios_user_id ON public.negocios (user_id);
-- slug en negocios (usado en menú público)
CREATE UNIQUE INDEX IF NOT EXISTS idx_negocios_slug ON public.negocios (slug);
-- negocio_id en productos
CREATE INDEX IF NOT EXISTS idx_productos_negocio_id ON public.productos (negocio_id);
-- negocio_id en clientes
CREATE INDEX IF NOT EXISTS idx_clientes_negocio_id ON public.clientes (negocio_id);
-- negocio_id en categorias
CREATE INDEX IF NOT EXISTS idx_categorias_negocio_id ON public.categorias (negocio_id);

-- 4. CONSTRAINT faltante: slug único ya existe en CREATE TABLE original
-- Agregar NOT NULL donde corresponda
ALTER TABLE public.pedidos ALTER COLUMN estado SET NOT NULL;
ALTER TABLE public.pedidos ALTER COLUMN total SET NOT NULL;
ALTER TABLE public.productos ALTER COLUMN precio SET NOT NULL;
ALTER TABLE public.clientes ALTER COLUMN negocio_id SET NOT NULL;

-- 5. RLS POLICIES (sugeridas - habilitar si se desea RLS a nivel BD)
-- NOTA: Por ahora el aislamiento multi-tenant se maneja desde el código (server-side filtering).
-- Estas policies son complementarias para seguridad en profundidad.

-- Habilitar RLS en todas las tablas
ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Policy: cada usuario solo ve su propio negocio
-- NOTA: Ajustar según la lógica de negocio (estas son policies base)

-- negocios: el usuario autenticado ve solo su negocio
CREATE POLICY "usuarios_ven_su_negocio" ON public.negocios
  FOR ALL USING (auth.uid() = user_id);

-- productos: el usuario ve productos de su negocio (vía JOIN)
CREATE POLICY "usuarios_ven_sus_productos" ON public.productos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.negocios
      WHERE negocios.id = productos.negocio_id
        AND negocios.user_id = auth.uid()
    )
  );

-- pedidos: el usuario ve pedidos de su negocio
CREATE POLICY "usuarios_ven_sus_pedidos" ON public.pedidos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.negocios
      WHERE negocios.id = pedidos.negocio_id
        AND negocios.user_id = auth.uid()
    )
  );

-- clientes: el usuario ve clientes de su negocio
CREATE POLICY "usuarios_ven_sus_clientes" ON public.clientes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.negocios
      WHERE negocios.id = clientes.negocio_id
        AND negocios.user_id = auth.uid()
    )
  );

-- pedido_items: el usuario ve items de pedidos de su negocio
CREATE POLICY "usuarios_ven_sus_pedido_items" ON public.pedido_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pedidos
        JOIN public.negocios ON negocios.id = pedidos.negocio_id
      WHERE pedidos.id = pedido_items.pedido_id
        AND negocios.user_id = auth.uid()
    )
  );

-- categorias: el usuario ve categorías de su negocio
CREATE POLICY "usuarios_ven_sus_categorias" ON public.categorias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.negocios
      WHERE negocios.id = categorias.negocio_id
        AND negocios.user_id = auth.uid()
    )
  );

-- 6. Política pública: cualquiera puede ver negocios (para el menú público)
-- Esto anula la policy anterior para SELECT
DROP POLICY IF EXISTS "usuarios_ven_su_negocio" ON public.negocios;

CREATE POLICY "negocios_publicos_select" ON public.negocios
  FOR SELECT USING (true);

CREATE POLICY "negocios_propio_all" ON public.negocios
  FOR ALL USING (auth.uid() = user_id);

-- Insert público en pedidos (para el menú público)
CREATE POLICY "pedidos_insert_publico" ON public.pedidos
  FOR INSERT WITH CHECK (true);

-- Insert público en pedido_items
CREATE POLICY "pedido_items_insert_publico" ON public.pedido_items
  FOR INSERT WITH CHECK (true);

-- NOTA: Revisar y ajustar estas policies según los requerimientos exactos de seguridad.
-- Las policies de INSERT público permiten que cualquier persona cree pedidos,
-- lo cual es necesario para el flujo de menú público.
