import { createClient } from "@/core/lib/supabase/server";
import { Users } from "lucide-react";
import {
  ClientRadar,
  ClienteResumen,
} from "@/features/client-radar/components/ClientRadar";

export default async function ClientesPage() {
  const supabase = await createClient();

  // 1. Extracción de contexto asumiendo layout seguro
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user?.id)
    .single();

  if (!negocio) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] font-sans">
        <h2 className="text-sm font-black uppercase bg-red-100 text-red-700 p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          [CRITICAL ERROR]: INFRAESTRUCTURA TENANT INCOMPLETA.
        </h2>
      </div>
    );
  }

  // 2. Traemos comandas de forma limpia para cálculo asíncrono
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("cliente_nombre, total, cliente_whatsapp")
    .eq("negocio_id", negocio.id);

  // 3. Motor de agregación de datos con Tipado Estricto (Cero Warnings)
  const resumenClientes = (pedidos || []).reduce<
    Record<string, ClienteResumen>
  >((acc, pedido) => {
    const nombreLimpio =
      pedido.cliente_nombre?.trim().toUpperCase() || "CONSUMIDOR ANÓNIMO";
    const whatsapp = pedido.cliente_whatsapp || null;

    if (!acc[nombreLimpio]) {
      acc[nombreLimpio] = {
        id: crypto.randomUUID(),
        nombre: nombreLimpio,
        telefono: whatsapp,
        email: null, // Si sumás login de clientes relacionales poblar acá
        totalGasto: 0,
        pedidos: 0,
        notas: null,
      };
    }

    acc[nombreLimpio].totalGasto += Number(pedido.total || 0);
    acc[nombreLimpio].pedidos += 1;
    return acc;
  }, {});

  const listaClientes = Object.values(resumenClientes).sort(
    (a, b) => b.totalGasto - a.totalGasto,
  );

  return (
    <div className="space-y-10 font-sans text-black max-w-7xl mx-auto">
      {/* HEADER DE COMUNIDAD */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#A3FF00] p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
            <Users size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-gray-400">
            METRICS // DATA RADAR COMMUNITY
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-[0.8] text-black">
            NUESTRA <br /> COMUNIDAD
          </h1>
          <p className="max-w-2xl text-xs font-bold uppercase text-gray-500 border-l-4 border-black pl-4 leading-normal">
            Análisis algorítmico de volumen de compra, ranking de retención y
            control de expedientes de usuarios en hora pico.
          </p>
        </div>
      </header>

      {/* RENDER DEL SUB-MÓDULO INTEGRADOR */}
      <main>
        <ClientRadar initialClientes={listaClientes} />
      </main>
    </div>
  );
}
