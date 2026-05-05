import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Settings, ShieldCheck, Activity } from "lucide-react";
// Importación nombrada para evitar errores de exportación por defecto
import { ConfigForm } from "@/components/adminPanel/configuracion/ConfigForm";

/**
 * Página de Configuración del Panel de Administración.
 * Actúa como Server Component para seguridad y obtención de datos iniciales.
 */
export default async function ConfiguracionPage() {
  const supabase = await createClient();

  // 1. Verificación de sesión de usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Obtener los datos actuales del negocio vinculados al usuario
  const { data: negocio, error } = await supabase
    .from("negocios")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && !negocio) {
    console.error("DEBUG NEO -> Error al cargar configuración:", error.message);
  }

  return (
    <div className="p-6 md:p-10 space-y-10 min-h-screen pb-32 max-w-5xl animate-in fade-in duration-500">
      {/* Encabezado Principal */}
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="text-primary w-5 h-5 animate-spin-slow" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
            Neo Control Center
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-text-primary uppercase tracking-tighter italic leading-none">
          Configuración
        </h1>
        <p className="text-text-muted text-xs font-bold uppercase tracking-widest">
          Personaliza la identidad visual y operativa de tu catálogo digital
        </p>
      </header>

      {/* 
          Formulario de Cliente: Maneja estados de carga de imagen, 
          validaciones y sincronización con Supabase.
      */}
      <ConfigForm initialData={negocio} userId={user.id} />

      {/* Footer Técnico Estilo NEO */}
      <footer className="pt-10 border-t-2 border-dashed border-border flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
        <div className="flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-widest italic">
            NEO OS v1.0.4 — {new Date().getFullYear()}
          </p>
          <span className="text-[8px] font-bold text-primary uppercase">
            Estudio Camaleón Labs
          </span>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-green-500" />
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
