import { createClient } from "@/core/lib/supabase/server";
import { getAuthenticatedTenant } from "@/core/lib/tenant";
import { redirect } from "next/navigation";
import { PromosSection } from "@/features/admin/promos/components/PromosSection";

export default async function PromosPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  let negocioId: string;

  try {
    negocioId = await getAuthenticatedTenant(supabase);
  } catch {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <PromosSection negocioId={negocioId} />
    </div>
  );
}
