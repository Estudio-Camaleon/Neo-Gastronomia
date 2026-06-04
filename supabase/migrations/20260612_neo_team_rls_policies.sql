-- ============================================================
-- NEO TEAM MEMBER RLS POLICIES
-- ============================================================
-- Actualiza las policies RLS de pedidos, pedido_items, productos,
-- categorias y clientes para permitir acceso a team members.
-- ============================================================

-- Helper function: check if user owns the negocio OR is a team member
CREATE OR REPLACE FUNCTION public.usuario_accede_negocio(p_negocio_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.negocios
    WHERE negocios.id = p_negocio_id
      AND negocios.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.negocio_id = p_negocio_id
      AND team_members.user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.usuario_accede_negocio TO authenticated;

-- ──────────────────────────────────────────────────────────────
-- 1. pedidos
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "usuarios_ven_sus_pedidos" ON public.pedidos;
CREATE POLICY "usuarios_ven_sus_pedidos" ON public.pedidos
  FOR ALL USING (
    usuario_accede_negocio(pedidos.negocio_id)
  );

-- ──────────────────────────────────────────────────────────────
-- 2. pedido_items
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "usuarios_ven_sus_pedido_items" ON public.pedido_items;
CREATE POLICY "usuarios_ven_sus_pedido_items" ON public.pedido_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pedidos
      WHERE pedidos.id = pedido_items.pedido_id
        AND usuario_accede_negocio(pedidos.negocio_id)
    )
  );

-- ──────────────────────────────────────────────────────────────
-- 3. productos
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "usuarios_ven_sus_productos" ON public.productos;
CREATE POLICY "usuarios_ven_sus_productos" ON public.productos
  FOR ALL USING (
    usuario_accede_negocio(productos.negocio_id)
  );

-- ──────────────────────────────────────────────────────────────
-- 4. categorias
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "usuarios_ven_sus_categorias" ON public.categorias;
CREATE POLICY "usuarios_ven_sus_categorias" ON public.categorias
  FOR ALL USING (
    usuario_accede_negocio(categorias.negocio_id)
  );

-- ──────────────────────────────────────────────────────────────
-- 5. clientes
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "usuarios_ven_sus_clientes" ON public.clientes;
CREATE POLICY "usuarios_ven_sus_clientes" ON public.clientes
  FOR ALL USING (
    usuario_accede_negocio(clientes.negocio_id)
  );
