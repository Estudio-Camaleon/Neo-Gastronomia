import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Settings, ShieldCheck, Activity } from "lucide-react";
import {
  ConfigForm,
  type NegocioInitialData,
} from "@/components/adminPanel/configuracion/ConfigForm";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: negocio } = await supabase
    .from("negocios")
    .select(
      `id, nombre, slug, whatsapp, direccion, localidad, direccion_notas, color_primary, logo_url, banner_url, horarios, instagram_url, facebook_url, tiktok_url`,
    )
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-12 max-w-5xl mx-auto animate-in fade-in duration-700 pb-20">
      <header className="space-y-4 border-b-2 border-[var(--admin-border)] pb-8">
        <div className="flex items-center gap-2 opacity-50">
          <Settings size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">
            System / Configuration
          </span>
        </div>
        <h1 className="text-6xl font-black text-[var(--admin-text)] uppercase tracking-tighter italic leading-none">
          Panel de <span className="text-[var(--admin-accent)]">Control</span>
        </h1>
      </header>

      <ConfigForm
        initialData={(negocio as unknown as NegocioInitialData) || null}
        userId={user.id}
      />

      <footer className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30">
        <div className="font-mono text-[10px] font-bold uppercase tracking-tighter">
          NEO CORE ENGINE v1.2.0 // {new Date().getFullYear()}
        </div>
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-[var(--admin-accent)]" />{" "}
            <span className="text-[9px] font-black uppercase">
              Link: Stable
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} />{" "}
            <span className="text-[9px] font-black uppercase">
              Auth: Encrypted
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
