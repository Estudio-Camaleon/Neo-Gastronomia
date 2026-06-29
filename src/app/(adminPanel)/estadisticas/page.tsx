import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAdminNegocioContext } from "@/core/lib/tenant";
import { hasFeature } from "@/core/lib/billing";
import type { PlanTier } from "@/core/lib/billing";
import { StatsDashboard } from "@/features/admin/stats/components/StatsDashboard";
import { UpgradePrompt } from "@/features/admin/billing/components/UpgradePrompt";

export const dynamic = "force-dynamic";

export default async function EstadisticasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { negocio } = await getAdminNegocioContext(
    supabase,
    user.id,
    "id, plan_tier",
  );

  if (!negocio) redirect("/configuracion");

  const negocioId = negocio.id as string;
  const planTier = (negocio.plan_tier as PlanTier) ?? "free";

  if (!hasFeature(planTier, "analytics")) {
    return <UpgradePrompt feature="estadísticas" />;
  }

  return (
    <StatsDashboard negocioId={negocioId} />
  );
}
