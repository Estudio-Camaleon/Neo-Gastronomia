import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
// Importar el componente de formulario que crearemos para manejar el estado del cliente
import { ConfigForm } from "@/components/adminPanel/ConfigForm";

export default async function ConfiguracionPage() {
  const supabase = await createClient();

  // 1. Verificación de seguridad
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Obtener los datos actuales del negocio
  const { data: negocio, error } = await supabase
    .from("negocios")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Si no hay negocio, podríamos redirigir a un onboarding o crear uno por defecto
  if (error && !negocio) {
    console.error("Error al cargar configuración:", error.message);
  }

  return (
    <div className="p-6 md:p-10 space-y-10 min-h-screen pb-32 max-w-5xl">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="text-primary w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
            Control Center
          </span>
        </div>
        <h1 className="text-5xl font-black text-text-primary uppercase tracking-tighter italic leading-none">
          Configuración
        </h1>
        <p className="text-text-muted text-xs font-bold uppercase tracking-widest">
          Personaliza la identidad y operativa de tu catálogo
        </p>
      </header>

      {/* 
          Pasamos los datos del negocio al componente de cliente 'ConfigForm'
          Este componente se encargará de los inputs, validaciones y el guardado.
      */}
      <ConfigForm initialData={negocio} userId={user.id} />

      <footer className="pt-10 border-t border-dashed border-border flex flex-col md:flex-row justify-between items-center gap-4 opacity-50">
        <p className="text-[10px] font-black uppercase tracking-widest italic">
          NEO OS v1.0 — {new Date().getFullYear()}
        </p>
        <div className="flex gap-6">
          <span className="text-[9px] font-bold uppercase">
            System Status: Optimal
          </span>
          <span className="text-[9px] font-bold uppercase">
            Encryption: AES-256
          </span>
        </div>
      </footer>
    </div>
  );
}
