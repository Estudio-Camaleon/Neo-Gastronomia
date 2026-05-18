/**
 * NEO SYSTEM v3.0 - Portal Maestro de Configuración
 * Server Component puro encargado del abastecimiento de data de marca del local.
 */
import { createClient } from "@/core/lib/supabase/server";
import { Settings, ShieldCheck, Activity } from "lucide-react";
import {
  ConfigForm,
  type NegocioInitialData,
} from "@/features/tenant-branding/components/ConfigForm";

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
    .eq("user_id", user?.id)
    .single();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 font-sans text-black">
      {/* HEADER DE AUDITORÍA */}
      <header className="space-y-2 border-b-4 border-black pb-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Settings size={14} />
          <span className="text-[10px] font-mono font-black uppercase tracking-widest">
            TERMINAL // BRANDING IDENTITY CONTROL
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter italic leading-none">
          Panel de{" "}
          <span className="bg-black text-[#A3FF00] px-3 py-0.5 inline-block transform rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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
      <footer className="pt-8 border-t-2 border-dashed border-black/10 flex flex-col sm:flex-row justify-between items-center gap-4 opacity-40 select-none">
        <div className="font-mono text-[9px] font-black uppercase tracking-widest">
          NEO CORE SYSTEM ENGINE v3.0 // STABLE BUILD
        </div>
        <div className="flex gap-6 font-mono text-[9px] font-black uppercase">
          <div className="flex items-center gap-1.5">
            <Activity size={10} className="text-emerald-500 animate-pulse" />
            <span>SOCKETS: LIVE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={10} className="text-black" />
            <span>RLS: ENFORCED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
