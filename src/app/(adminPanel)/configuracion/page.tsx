/**
 * NEO SYSTEM v3.0 - Portal Maestro de Configuración
 * Server Component puro encargado del abastecimiento de data de marca del local.
 */
import { createClient } from "@/core/lib/supabase/server";
import { Settings, ShieldCheck, Activity } from "lucide-react";
import {
  ConfigForm,
  type NegocioInitialData,
} from "@/features/admin/branding/components/ConfigForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: negocio } = await supabase
    .from("negocios")
    .select(
      `id, nombre, slug, whatsapp, direccion, localidad, direccion_notas, color_primary, logo_url, banner_url, horarios, instagram_url, facebook_url, tiktok_url`,
    )
    .eq("user_id", user?.id ?? "")
    .single();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 relative z-10">
      {/* HEADER DE AUDITORÍA */}
      <header className="space-y-3 border-b border-[var(--admin-border)]/50 pb-6">
        <div className="flex items-center gap-2 text-[var(--admin-text-muted)]">
          <Settings size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Identidad y Configuración
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--admin-text)] flex items-center gap-3">
          Panel de
          <span className="bg-[var(--admin-accent)] text-white px-3 py-1 rounded-xl text-3xl md:text-5xl shadow-md shadow-[var(--admin-accent)]/20">
            Control
          </span>
        </h1>
      </header>

      {/* FORMULARIO UNIFICADO DE RED */}
      <ConfigForm
        initialData={(negocio as unknown as NegocioInitialData) || null}
        userId={user?.id || ""}
      />

      {/* FOOTER OPERATIVO INDUSTRIAL */}
      <footer className="pt-8 border-t border-[var(--admin-border)]/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-[var(--admin-text-muted)] select-none">
        <div className="text-xs font-medium tracking-wide">
          NEO CORE SYSTEM ENGINE v3.0
        </div>
        <div className="flex gap-6 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Activity
              size={14}
              className="text-[var(--admin-accent)] animate-pulse"
            />
            <span>EN LÍNEA</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[var(--admin-text)]" />
            <span>PROTEGIDO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
