-- ============================================================
-- 20260619: Storage restructuring — folder-per-negocio
-- ============================================================
-- Adds cleanup for the new path structure:
--   media/{negocioId}/logo/logo.ext
--   media/{negocioId}/banner/banner.ext
--   media/{negocioId}/productos/{uuid}.ext
--   media/{negocioId}/combos/{uuid}.ext
-- Keeps backward compat with old paths:
--   identidad/{negocioId}/logo_url
--   identidad/{negocioId}/banner_url
--   products/{negocioId}-{userId}-{ts}.ext
--   promos/{negocioId}-{ts}.ext
-- ============================================================

CREATE OR REPLACE FUNCTION public.eliminar_negocio_completo(
  p_negocio_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_logo_url text;
  v_banner_url text;
  v_result jsonb;
  v_storage_count int := 0;
  v_nombre text;
  r record;
BEGIN
  SELECT logo_url, banner_url, nombre
  INTO v_logo_url, v_banner_url, v_nombre
  FROM negocios WHERE id = p_negocio_id;

  IF v_nombre IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Negocio no encontrado'
    );
  END IF;

  -- ── NEW STRUCTURE: media/{negocioId}/... (logo, banner, productos, combos) ──
  FOR r IN
    SELECT name FROM storage.objects
    WHERE bucket_id = 'media' AND name LIKE (p_negocio_id::text || '/%')
  LOOP
    DELETE FROM storage.objects
    WHERE bucket_id = 'media' AND name = r.name;
    IF FOUND THEN
      v_storage_count := v_storage_count + 1;
    END IF;
  END LOOP;

  -- ── OLD STRUCTURE: products/{negocioId}-* ──
  FOR r IN
    SELECT name FROM storage.objects
    WHERE bucket_id = 'media'
      AND name LIKE ('products/' || p_negocio_id::text || '-%')
  LOOP
    DELETE FROM storage.objects
    WHERE bucket_id = 'media' AND name = r.name;
    IF FOUND THEN
      v_storage_count := v_storage_count + 1;
    END IF;
  END LOOP;

  -- ── OLD STRUCTURE: promos/{negocioId}-* ──
  FOR r IN
    SELECT name FROM storage.objects
    WHERE bucket_id = 'media'
      AND name LIKE ('promos/' || p_negocio_id::text || '-%')
  LOOP
    DELETE FROM storage.objects
    WHERE bucket_id = 'media' AND name = r.name;
    IF FOUND THEN
      v_storage_count := v_storage_count + 1;
    END IF;
  END LOOP;

  -- ── OLD STRUCTURE: identidad/{negocioId}/logo_url (bucket: imagenes-negocios) ──
  IF v_logo_url IS NOT NULL AND v_logo_url ~ '/public/imagenes-negocios/' THEN
    DECLARE
      v_logo_path text;
    BEGIN
      v_logo_path := regexp_replace(
        regexp_replace(v_logo_url, '^.*/public/imagenes-negocios/', ''),
        '[?#].*$', ''
      );
      DELETE FROM storage.objects
      WHERE bucket_id = 'imagenes-negocios' AND name = v_logo_path;
      IF FOUND THEN v_storage_count := v_storage_count + 1; END IF;
    END;
  END IF;

  -- ── OLD STRUCTURE: identidad/{negocioId}/banner_url (bucket: imagenes-negocios) ──
  IF v_banner_url IS NOT NULL AND v_banner_url ~ '/public/imagenes-negocios/' THEN
    DECLARE
      v_banner_path text;
    BEGIN
      v_banner_path := regexp_replace(
        regexp_replace(v_banner_url, '^.*/public/imagenes-negocios/', ''),
        '[?#].*$', ''
      );
      DELETE FROM storage.objects
      WHERE bucket_id = 'imagenes-negocios' AND name = v_banner_path;
      IF FOUND THEN v_storage_count := v_storage_count + 1; END IF;
    END;
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
