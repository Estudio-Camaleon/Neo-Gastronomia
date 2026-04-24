import { createClient } from "@/lib/supabase/server"; // Importante: ruta al cliente de servidor
import { redirect } from "next/navigation";
import { ConfigForm } from "@/components/dashboard/ConfigForm";

export default async function ConfigPage() {
  // Inicializamos el cliente de servidor
  const supabase = await createClient();

  // 1. Obtención segura del usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Consulta de datos del negocio
  const { data: negocio, error } = await supabase
    .from("negocios")
    .select("nombre, whatsapp")
    .eq("user_id", user.id)
    .single();

  // 3. Manejo de error si no existe el registro (opcional, pero recomendado)
  if (error) {
    console.error("Error cargando negocio:", error);
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Configuración del Negocio</h1>

      {/* El componente ConfigForm ahora recibe la data inicial.
        Si 'negocio' es null, el componente manejará los inputs vacíos.
      */}
      <ConfigForm initialData={negocio} />
    </div>
  );
}
