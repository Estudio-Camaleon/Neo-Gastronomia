import { createClient } from "@/core/lib/supabase/server";

export type PlanTier = "free" | "pro";

interface PlanLimits {
  maxProducts: number;
  maxCategories: number;
  teamMembers: boolean;
  analytics: boolean;
  exportData: boolean;
}

const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxProducts: 50,
    maxCategories: 15,
    teamMembers: false,
    analytics: false,
    exportData: false,
  },
  pro: {
    maxProducts: 9999,
    maxCategories: 999,
    teamMembers: true,
    analytics: true,
    exportData: true,
  },
};

export async function getPlanTier(negocioId: string): Promise<PlanTier> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase.from("negocios" as never) as any;
    const { data } = await db
      .select("plan_tier")
      .eq("id", negocioId)
      .limit(1)
      .single();
    return (data?.plan_tier as PlanTier) ?? "free";
  } catch {
    return "free";
  }
}

export function getPlanLimits(tier: PlanTier): PlanLimits {
  return PLAN_LIMITS[tier];
}

export async function canAddProduct(
  negocioId: string,
  currentCount: number,
): Promise<boolean> {
  const tier = await getPlanTier(negocioId);
  const limits = getPlanLimits(tier);
  return currentCount < limits.maxProducts;
}

export async function canAddCategory(
  negocioId: string,
  currentCount: number,
): Promise<boolean> {
  const tier = await getPlanTier(negocioId);
  const limits = getPlanLimits(tier);
  return currentCount < limits.maxCategories;
}

export type BooleanFeature = "teamMembers" | "analytics" | "exportData";

export function hasFeature(tier: PlanTier, feature: BooleanFeature): boolean {
  return getPlanLimits(tier)[feature];
}
