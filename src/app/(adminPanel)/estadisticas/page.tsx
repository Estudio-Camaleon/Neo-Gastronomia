import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatsDashboard } from "@/features/admin/stats/components/StatsDashboard";

export default async function EstadisticasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let negocioId: string | null = null;

  const { data: negocios } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  negocioId = negocios?.[0]?.id ?? null;

  if (!negocioId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberships } = await (supabase.from("team_members" as any) as any)
      .select("negocio_id")
      .eq("user_id", user.id)
      .limit(1);

    negocioId = memberships?.[0]?.negocio_id ?? null;
  }

  if (!negocioId) redirect("/configuracion");

  return (
    <StatsDashboard negocioId={negocioId} />
  );
}
