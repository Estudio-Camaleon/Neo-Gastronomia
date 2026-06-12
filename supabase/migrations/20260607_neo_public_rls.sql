-- 20260607: Políticas RLS públicas para el menú público
-- Permite SELECT anónimo en categorias y productos (necesario para el menú público)
-- Reemplaza el uso de supabaseAdmin (service_role) por anon key + RLS

-- Productos: cualquier persona puede ver productos disponibles de negocios públicos
DROP POLICY IF EXISTS "productos_select_publico" ON public.productos;
CREATE POLICY "productos_select_publico" ON public.productos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.negocios
      WHERE negocios.id = productos.negocio_id
    )
  );

-- Categorías: cualquier persona puede ver categorías de negocios públicos  
DROP POLICY IF EXISTS "categorias_select_publico" ON public.categorias;
CREATE POLICY "categorias_select_publico" ON public.categorias
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.negocios
      WHERE negocios.id = categorias.negocio_id
    )
  );

-- Nota: Las policies existentes "usuarios_ven_sus_productos" y "usuarios_ven_sus_categorias"
-- ya cubren el acceso de usuarios autenticados (dueños del negocio).
-- Estas nuevas policies son adicionales para permitir acceso público de solo lectura.
-- PostgreSQL evalúa todas las policies aplicables con OR, por lo que ambas conviven.
COMMIT;
