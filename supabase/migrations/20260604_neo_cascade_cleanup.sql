-- ============================================================
-- NEO CASCADE CLEANUP & PURGE FUNCTIONS
-- ============================================================
-- 1. Foreign keys con ON DELETE CASCADE
-- 2. Funciones de purga: eliminar_negocio_completo,
--    eliminar_usuario_completo, listar_negocios_usuario
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. FOREIGN KEYS CON CASCADE
-- ──────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE public.productos
    DROP CONSTRAINT IF EXISTS fk_productos_negocio;
  ALTER TABLE public.productos
    ADD CONSTRAINT fk_productos_negocio
    FOREIGN KEY (negocio_id) REFERENCES public.negocios(id)
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.categorias
    DROP CONSTRAINT IF EXISTS fk_categorias_negocio;
  ALTER TABLE public.categorias
    ADD CONSTRAINT fk_categorias_negocio
    FOREIGN KEY (negocio_id) REFERENCES public.negocios(id)
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.pedidos
    DROP CONSTRAINT IF EXISTS fk_pedidos_negocio;
  ALTER TABLE public.pedidos
    ADD CONSTRAINT fk_pedidos_negocio
    FOREIGN KEY (negocio_id) REFERENCES public.negocios(id)
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.pedido_items
    DROP CONSTRAINT IF EXISTS fk_pedido_items_pedido;
  ALTER TABLE public.pedido_items
    ADD CONSTRAINT fk_pedido_items_pedido
    FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id)
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.clientes
    DROP CONSTRAINT IF EXISTS fk_clientes_negocio;
  ALTER TABLE public.clientes
    ADD CONSTRAINT fk_clientes_negocio
    FOREIGN KEY (negocio_id) REFERENCES public.negocios(id)
    ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ──────────────────────────────────────────────────────────────
-- 2. FUNCIÓN: eliminar_negocio_completo
-- ──────────────────────────────────────────────────────────────
-- SELECT eliminar_negocio_completo('uuid-del-negocio');

CREATE OR REPLACE FUNCTION public.eliminar_negocio_completo(
  p_negocio_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_logo_path text;
  v_banner_path text;
  v_result jsonb;
  v_storage_count int := 0;
  v_nombre text;
  r record;
BEGIN
  SELECT logo_url, banner_url, nombre
  INTO v_logo_path, v_banner_path, v_nombre
  FROM negocios WHERE id = p_negocio_id;

  IF v_nombre IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Negocio no encontrado'
    );
  END IF;

  -- Eliminar imágenes de productos en storage (bucket: media)
  FOR r IN
    SELECT DISTINCT regexp_replace(
      regexp_replace(imagen_url, '^.*/public/media/', ''),
      '[?#].*$', ''
    ) AS storage_name
    FROM productos WHERE negocio_id = p_negocio_id
      AND imagen_url IS NOT NULL
      AND imagen_url ~ '/public/media/'
  LOOP
    DELETE FROM storage.objects
    WHERE bucket_id = 'media' AND name = r.storage_name;
    IF FOUND THEN
      v_storage_count := v_storage_count + 1;
    END IF;
  END LOOP;

  -- Eliminar logo (bucket: imagenes-negocios)
  IF v_logo_path IS NOT NULL AND v_logo_path ~ '/public/imagenes-negocios/' THEN
    v_logo_path := regexp_replace(
      regexp_replace(v_logo_path, '^.*/public/imagenes-negocios/', ''),
      '[?#].*$', ''
    );
    DELETE FROM storage.objects
    WHERE bucket_id = 'imagenes-negocios' AND name = v_logo_path;
    IF FOUND THEN v_storage_count := v_storage_count + 1; END IF;
  END IF;

  -- Eliminar banner (bucket: imagenes-negocios)
  IF v_banner_path IS NOT NULL AND v_banner_path ~ '/public/imagenes-negocios/' THEN
    v_banner_path := regexp_replace(
      regexp_replace(v_banner_path, '^.*/public/imagenes-negocios/', ''),
      '[?#].*$', ''
    );
    DELETE FROM storage.objects
    WHERE bucket_id = 'imagenes-negocios' AND name = v_banner_path;
    IF FOUND THEN v_storage_count := v_storage_count + 1; END IF;
  END IF;

  -- Eliminar el negocio (CASCADEA a productos, categorias,
  -- pedidos, pedido_items, clientes gracias a las FKs)
  DELETE FROM public.negocios WHERE id = p_negocio_id;

  RETURN jsonb_build_object(
    'success', true,
    'negocio', v_nombre,
    'storage_files_deleted', v_storage_count
  );
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 3. FUNCIÓN: eliminar_usuario_completo
-- ──────────────────────────────────────────────────────────────
-- SELECT eliminar_usuario_completo('uuid-del-usuario');

CREATE OR REPLACE FUNCTION public.eliminar_usuario_completo(
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage, auth
AS $$
DECLARE
  v_negocio_id uuid;
  v_nombre text;
  v_result jsonb;
  v_auth_deleted boolean := false;
BEGIN
  SELECT id, nombre INTO v_negocio_id, v_nombre
  FROM negocios WHERE user_id = p_user_id;

  IF v_negocio_id IS NOT NULL THEN
    v_result := eliminar_negocio_completo(v_negocio_id);
  END IF;

  DELETE FROM auth.users WHERE id = p_user_id;
  v_auth_deleted := FOUND;

  RETURN jsonb_build_object(
    'success', true,
    'negocio_eliminado', v_negocio_id IS NOT NULL,
    'negocio_nombre', v_nombre,
    'resultado_negocio', v_result,
    'auth_user_deleted', v_auth_deleted
  );
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 4. FUNCIÓN: listar_negocios_usuario
-- ──────────────────────────────────────────────────────────────
-- SELECT * FROM listar_negocios_usuario('email@ejemplo.com');
-- SELECT * FROM listar_negocios_usuario(); -- todos

CREATE OR REPLACE FUNCTION public.listar_negocios_usuario(
  p_email text DEFAULT NULL
)
RETURNS TABLE(
  user_id uuid,
  user_email text,
  negocio_id uuid,
  negocio_nombre text,
  negocio_slug text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    n.id,
    n.nombre,
    n.slug,
    n.created_at
  FROM auth.users u
  JOIN negocios n ON n.user_id = u.id
  WHERE p_email IS NULL OR u.email = p_email
  ORDER BY u.created_at DESC;
END;
$$;
