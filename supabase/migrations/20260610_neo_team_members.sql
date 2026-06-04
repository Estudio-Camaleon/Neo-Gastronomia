-- 20260610: Team members - multi-usuario para negocios
-- Permite que un negocio tenga multiples usuarios con diferentes roles

CREATE TYPE public.team_role AS ENUM ('admin', 'staff', 'viewer');

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role team_role NOT NULL DEFAULT 'staff',
  invited_by UUID, -- user_id que invito
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_members_negocio_id ON public.team_members (negocio_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_unique ON public.team_members (negocio_id, user_id);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- El owner del negocio ve todos los members
CREATE POLICY "team_members_owner_select" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.negocios
      WHERE negocios.id = team_members.negocio_id
        AND negocios.user_id = auth.uid()
    )
  );

-- Un miembro del team se ve a si mismo
CREATE POLICY "team_members_self_select" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id);

-- Solo el owner puede insertar/update/delete miembros
CREATE POLICY "team_members_owner_all" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.negocios
      WHERE negocios.id = team_members.negocio_id
        AND negocios.user_id = auth.uid()
    )
  );

-- Actualizar policies existentes de negocios para aceptar team_members
-- (ya existe "negocios_propio_all" que permite al owner, y "negocios_publicos_select" que permite a todos)

-- Nota: Para dar acceso a otros recursos (productos, pedidos) a los team members,
-- se deben actualizar las policies correspondientes. Esto se hara en migraciones futuras.
