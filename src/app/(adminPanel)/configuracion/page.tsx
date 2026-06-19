import { createClient } from "@/core/lib/supabase/server";
import { Settings } from "lucide-react";
import {
  ConfigForm,
  type NegocioInitialData,
} from "@/features/admin/branding/components/ConfigForm";
import { WelcomeToast } from "@/features/admin/shared/WelcomeToast";
import { UpgradeFlow } from "@/features/admin/billing/components/UpgradeFlow";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ConfiguracionPage(props: {
  searchParams?: Promise<{
    firstLogin?: string;
    upgrade?: string;
    collection_status?: string;
    preapproval_id?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const firstLogin = searchParams?.firstLogin === "true";
  const mpSuccess = searchParams?.collection_status === "approved";
  const upgradeAction = mpSuccess ? "success" : (searchParams?.upgrade ?? null);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: negocios } = await supabase
    .from("negocios")
    .select(
      `id, nombre, slug, whatsapp, descripcion, direccion, localidad, direccion_notas, color_primary, logo_url, logo_scale, logo_posicion, logo_fit, logo_shape, banner_url, banner_posicion, banner_height, banner_scale, mostrar_nombre, horarios, instagram_url, facebook_url, tiktok_url, twitter_url, youtube_url, direcciones, whatsapp_mensajes`,
    )
    .eq("user_id", user?.id ?? "")
    .limit(1)
    .returns<NegocioInitialData[]>();

  const negocio = negocios?.[0] ?? null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 relative z-10">
      {firstLogin && <WelcomeToast />}

      {/* Upgrade flow */}
      {(upgradeAction === "success" || upgradeAction === "cancel" || upgradeAction === "true") && (
        <UpgradeFlow
          action={upgradeAction === "true" ? "checkout" : upgradeAction as "success" | "cancel"}
        />
      )}

      {/* HEADER DE AUDITORÍA */}
      <header className="space-y-3 border-b border-[var(--admin-border)]/50 pb-6">
        <div className="flex items-center gap-2 text-[var(--admin-text-muted)]">
          <Settings size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Identidad y Configuración
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-[var(--admin-text)] flex items-center gap-3">
          Panel de
          <span className="bg-[var(--admin-accent)] text-white px-2 sm:px-3 py-1 rounded-xl text-2xl sm:text-3xl md:text-5xl shadow-md shadow-[var(--admin-accent)]/20">
            Control
          </span>
        </h1>
      </header>

      {/* FORMULARIO UNIFICADO DE RED */}
      <ConfigForm initialData={negocio} userId={user?.id || ""} />
    </div>
  );
}
