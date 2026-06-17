import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { hasFeature } from "@/core/lib/billing";
import type { PlanTier } from "@/core/lib/billing";
import { StatsDashboard } from "@/features/admin/stats/components/StatsDashboard";
import { UpgradePrompt } from "@/features/admin/billing/components/UpgradePrompt";

export default async function EstadisticasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let negocioId: string | null = null;
  let planTier: PlanTier = "free";

  const { data: negocios } = await supabase
    .from("negocios")
    .select("id, plan_tier")
    .eq("user_id", user.id)
    .limit(1);

  if (negocios?.[0]) {
    negocioId = negocios[0].id;
    planTier = (negocios[0].plan_tier as PlanTier) ?? "free";
  }

  if (!negocioId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberships } = await (supabase.from("team_members" as any) as any)
      .select("negocio_id")
      .eq("user_id", user.id)
      .limit(1);

    if (memberships?.[0]) {
      const memberNegocioId = memberships[0].negocio_id;
      negocioId = memberNegocioId;

      const { data: negocioPlan } = await supabase
        .from("negocios")
        .select("plan_tier")
        .eq("id", memberNegocioId)
        .limit(1)
        .single();

      planTier = (negocioPlan?.plan_tier as PlanTier) ?? "free";
    }
  }

  if (!negocioId) redirect("/configuracion");

  if (!hasFeature(planTier, "analytics")) {
    return <UpgradePrompt feature="estadísticas" />;
  }

  return (
    <StatsDashboard negocioId={negocioId} />
  );
}
