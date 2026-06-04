-- ============================================================
-- NEO: Eliminar foreign keys duplicadas
-- ============================================================
-- Supabase auto-genera FKs con nombres como `tabla_columna_fkey`.
-- Nuestras migrations crean FKs con nombres explícitos (`fk_tabla_columna`).
-- Esto produce DUPLICADOS que rompen el resource embedding de Supabase REST:
--
--   "Could not embed because more than one relationship was found
--    for 'pedidos' and 'pedido_items'"
--
-- Este script elimina los FKs auto-generados para quedarnos solo
-- con los explícitos de nuestras migrations.
-- ============================================================

-- 1. pedido_items.pedido_id → pedidos.id
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pedido_items_pedido_id_fkey'
  ) THEN
    ALTER TABLE public.pedido_items DROP CONSTRAINT pedido_items_pedido_id_fkey;
    RAISE NOTICE 'Dropped duplicate FK: pedido_items_pedido_id_fkey';
  END IF;
END $$;

-- 2. productos.negocio_id → negocios.id
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'productos_negocio_id_fkey'
  ) THEN
    ALTER TABLE public.productos DROP CONSTRAINT productos_negocio_id_fkey;
    RAISE NOTICE 'Dropped duplicate FK: productos_negocio_id_fkey';
  END IF;
END $$;

-- 3. categorias.negocio_id → negocios.id
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'categorias_negocio_id_fkey'
  ) THEN
    ALTER TABLE public.categorias DROP CONSTRAINT categorias_negocio_id_fkey;
    RAISE NOTICE 'Dropped duplicate FK: categorias_negocio_id_fkey';
  END IF;
END $$;

-- 4. pedidos.negocio_id → negocios.id
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pedidos_negocio_id_fkey'
  ) THEN
    ALTER TABLE public.pedidos DROP CONSTRAINT pedidos_negocio_id_fkey;
    RAISE NOTICE 'Dropped duplicate FK: pedidos_negocio_id_fkey';
  END IF;
END $$;

-- 5. clientes.negocio_id → negocios.id
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'clientes_negocio_id_fkey'
  ) THEN
    ALTER TABLE public.clientes DROP CONSTRAINT clientes_negocio_id_fkey;
    RAISE NOTICE 'Dropped duplicate FK: clientes_negocio_id_fkey';
  END IF;
END $$;
