import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ConfigForm } from "./ConfigForm";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: negocio } = await supabase
    .from("negocios")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!negocio) return <div>Cargando...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-text-primary tracking-tighter uppercase italic">
          Configuración
        </h1>
      </header>
      <ConfigForm negocio={negocio} />
    </div>
  );
}
