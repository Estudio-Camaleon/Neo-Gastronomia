import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ConfigForm from "./ConfigForm";
import { Settings, ShieldCheck } from "lucide-react";

export default async function ConfiguracionPage() {
  const supabase = await createClient();

  // 1. Verificación de identidad (Server Side)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Obtención de datos del negocio con política de reintento o error claro
  const { data: negocio, error } = await supabase
    .from("negocios")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Si no hay negocio, es un error crítico de perfil incompleto
  if (error || !negocio) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-xl font-black uppercase italic text-text-primary">
          Perfil incompleto
        </h2>
        <p className="text-text-muted text-sm mt-2 max-w-xs">
          No pudimos encontrar la configuración de tu imperio. Contacta a
          soporte técnico de NEO.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-screen pb-20">
      {/* Header con jerarquía visual clara */}
      <header className="mb-12 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={18} className="text-primary animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              Panel de Control
            </span>
          </div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase italic leading-none">
            Configuración
          </h1>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-2">
            Personaliza la identidad y operativa de tu negocio
          </p>
        </div>
      </header>

      {/* El formulario recibe la data ya validada desde el servidor */}
      <div className="bg-white dark:bg-bg-darker p-1 rounded-super shadow-sm border-2 border-border dark:border-border-dark">
        <ConfigForm negocio={negocio} />
      </div>

      <footer className="mt-12 pt-6 border-t-2 border-border/50 dark:border-border-dark/50">
        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest leading-relaxed">
          Los cambios realizados aquí afectan directamente a tu <br />
          <span className="text-primary">página pública de menú</span> y al
          sistema de pedidos.
        </p>
      </footer>
    </div>
  );
}
