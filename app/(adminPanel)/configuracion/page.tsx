import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ConfigForm } from "@/components/adminPanel/ConfigForm";

export default async function ConfigPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: negocio, error } = await supabase
    .from("negocios")
    .select("nombre, whatsapp")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error cargando negocio:", error);
  }

  return (
    // Usamos max-w-3xl para que el formulario no se estire demasiado y se vea profesional
    <div className="p-8 mx-auto min-h-screen ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-inverse mb-2">
          Configuración del Negocio
        </h1>
        <p className="text-text-secondary">
          Gestiona los datos públicos de tu negocio y tu contacto principal.
        </p>
      </div>

      <ConfigForm initialData={negocio} />
    </div>
  );
}
