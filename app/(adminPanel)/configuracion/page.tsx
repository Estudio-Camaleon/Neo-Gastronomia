import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Settings, ShieldCheck, Activity } from "lucide-react";
import {
  ConfigForm,
  type NegocioInitialData,
} from "@/components/adminPanel/configuracion/ConfigForm";

/**
 * Página de Configuración del Panel de Administración.
 * Actúa como Server Component puro para control de accesos, seguridad y deshidratación inicial de datos.
 */
export default async function ConfiguracionPage() {
  const supabase = await createClient();

  // 1. Verificación estricta de sesión de usuario activa
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Obtener los datos actuales del negocio vinculados al usuario de manera tipada
  const { data: negocio, error } = await supabase
    .from("negocios")
    .select(
      `
      id,
      nombre,
      slug,
      whatsapp,
      direccion,
      color_primary,
      logo_url,
      banner_url,
      horarios
    `,
    )
    .eq("user_id", user.id)
    .single();

  if (error && !negocio) {
    console.error("DEBUG NEO -> Error al cargar configuración:", error.message);
  }

  return (
    <div className="p-6 md:p-10 space-y-10 min-h-screen pb-32 max-w-5xl mx-auto animate-in fade-in duration-500 font-sans relative">
      {/* Encabezado Principal */}
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="text-primary w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
            Neo Control Center
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-text-primary dark:text-text-inverse uppercase tracking-tighter italic leading-none">
          Configuración
        </h1>
        <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
          Personaliza la identidad visual y operativa de tu catálogo digital
        </p>
      </header>

      {/* Formulario Orquestador Client-Side sin descalces de contratos de datos */}
      <ConfigForm
        initialData={(negocio as unknown as NegocioInitialData) || null}
        userId={user.id}
      />

      {/* Footer Técnico Estilo NEO */}
      <footer className="pt-10 border-t-2 border-dashed border-border dark:border-border-dark flex flex-col md:flex-row justify-between items-center gap-4 opacity-40 transition-colors">
        <div className="flex flex-col text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-widest italic text-text-primary dark:text-text-inverse font-mono">
            NEO OS v1.0.5 — {new Date().getFullYear()}
          </p>
          <span className="text-[8px] font-black text-primary uppercase tracking-widest mt-0.5">
            Estudio Camaleón Labs
          </span>
        </div>

        <div className="flex gap-6 font-mono text-text-primary dark:text-text-inverse">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-green-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              System: Optimal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              Security: AES-256
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
