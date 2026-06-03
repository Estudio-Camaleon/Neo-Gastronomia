-- ============================================================
-- NEO — Seed data for local development
-- ============================================================
-- WARNING: This seeds the LOCAL database. Use with supabase start.
-- ============================================================

-- Insert a dev negocio (assumes auth user exists with known UUID)
-- Replace USER_UUID with a real user ID after signing up locally.
-- INSERT INTO public.negocios (id, user_id, nombre, slug, descripcion)
-- VALUES
--   ('dev-negocio-1', 'USER_UUID', 'Mi Local Dev', 'mi-local-dev', 'Local de prueba para desarrollo');

-- Example products
-- INSERT INTO public.productos (negocio_id, nombre, descripcion, precio, disponible)
-- VALUES
--   ('dev-negocio-1', 'Pizza Margherita', 'Mozzarella, tomate, albahaca', 1200, true),
--   ('dev-negocio-1', 'Hamburguesa Clásica', 'Carne, lechuga, tomate, cheddar', 950, true),
--   ('dev-negocio-1', 'Papas Fritas', 'Porción de papas crujientes', 500, true);

-- Example categories
-- INSERT INTO public.categorias (negocio_id, nombre, slug, icono)
-- VALUES
--   ('dev-negocio-1', 'Pizzas', 'pizzas', 'pizza'),
--   ('dev-negocio-1', 'Hamburguesas', 'hamburguesas', 'burger'),
--   ('dev-negocio-1', 'Bebidas', 'bebidas', 'drink'),
--   ('dev-negocio-1', 'Postres', 'postres', 'cake');
