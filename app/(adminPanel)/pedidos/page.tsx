import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Package,
  ExternalLink,
  MoreVertical,
  MessageSquare,
  Clock,
  CreditCard,
  User,
  MapPin,
} from "lucide-react";

import { TestOrderButton } from "@/components/adminPanel/TestOrderButton";
import { RealtimeOrders } from "@/components/adminPanel/RealtimeOrders";

export default async function PedidosPage() {
  const supabase = await createClient();

  // 1. Verificación de sesión
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Obtener el negocio vinculado al usuario logueado
  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre")
    .eq("user_id", user.id)
    .single();

  if (!negocio) redirect("/configuracion");

  // 3. Traer los pedidos del negocio (incluyendo el campo JSON 'items')
  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select("*")
    .eq("negocio_id", negocio.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-10 text-center bg-error/5 border-2 border-dashed border-error/20 rounded-super">
        <h2 className="text-error font-black uppercase italic">
          Error de Sincronización
        </h2>
        <p className="text-xs font-bold text-text-muted mt-2 uppercase tracking-widest">
          Revisa la conexión con Supabase
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200/50";
      case "en_preparacion":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200/50";
      case "listo":
        return "bg-primary/10 text-primary border-primary/20";
      case "entregado":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200/50";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10 min-h-screen pb-32">
      {/* El radar escucha cambios en la DB y refresca esta página automáticamente */}
      <RealtimeOrders negocioId={negocio.id} />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
              Live Radar
            </span>
          </div>
          <h1 className="text-5xl font-black text-text-primary uppercase tracking-tighter italic leading-none">
            Pedidos
          </h1>
        </div>

        <div className="bg-white dark:bg-bg-darker p-5 rounded-neo border-2 border-border dark:border-border-dark shadow-sm">
          <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">
            Facturación Hoy
          </p>
          <p className="text-3xl font-black text-text-primary tracking-tight italic">
            $
            {pedidos
              ?.reduce((acc, p) => acc + (Number(p.total) || 0), 0)
              .toLocaleString("es-AR")}
          </p>
        </div>
      </header>

      <div className="flex gap-4">
        <TestOrderButton />
      </div>

      <main className="grid gap-6">
        {!pedidos || pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border dark:border-border-dark rounded-super bg-gray-50/50 dark:bg-white/5 grayscale">
            <Package className="w-16 h-16 text-border mb-4 opacity-40" />
            <p className="text-text-muted font-black text-xl uppercase tracking-tighter italic">
              Esperando señal...
            </p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-super p-6 hover:border-primary transition-all duration-300 group shadow-sm"
            >
              <div className="flex flex-wrap lg:flex-nowrap justify-between gap-8">
                {/* Columna: Cliente */}
                <div className="flex-1 min-w-[250px] space-y-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[9px] uppercase font-black px-3 py-1 rounded-full border ${getStatusColor(pedido.estado)}`}
                    >
                      {pedido.estado.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase">
                      {format(new Date(pedido.created_at), "HH:mm 'hs'", {
                        locale: es,
                      })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight italic leading-tight flex items-center gap-2">
                      <User size={20} className="text-primary" />{" "}
                      {pedido.cliente_nombre}
                    </h3>
                    <p className="text-xs text-text-muted font-bold flex items-center gap-1.5 mt-2">
                      <MapPin size={14} className="text-primary" />
                      {pedido.direccion_entrega || "RETIRO EN LOCAL"}
                    </p>
                    <p className="text-[10px] text-text-muted font-black mt-2 uppercase flex items-center gap-2">
                      <CreditCard size={14} /> Pago: {pedido.metodo_pago}
                    </p>
                  </div>
                </div>

                {/* Columna: Comanda (Items desde JSONB) */}
                <div className="flex-[2] lg:border-x-2 lg:border-border/50 lg:px-8 hidden md:block">
                  <p className="text-[9px] uppercase font-black text-text-muted mb-4 tracking-[0.2em] opacity-50 flex items-center gap-2 italic">
                    <MessageSquare size={12} /> Detalle de cocina
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pedido.items?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="text-[11px] font-black bg-gray-50 dark:bg-white/5 p-2 rounded-xl border border-border flex justify-between group-hover:bg-primary/5 transition-colors"
                      >
                        <span className="uppercase tracking-tight truncate mr-2">
                          <span className="text-primary">{item.cantidad}x</span>{" "}
                          {item.nombre}
                        </span>
                      </div>
                    ))}
                  </div>
                  {pedido.notas && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                      <p className="text-[9px] text-amber-700 dark:text-amber-400 font-black italic uppercase leading-tight">
                        Nota: "{pedido.notas}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Columna: Total y WhatsApp */}
                <div className="flex flex-col items-end justify-between min-w-[160px]">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">
                      Importe
                    </p>
                    <p className="text-4xl font-black text-primary tracking-tighter italic">
                      ${Number(pedido.total).toLocaleString("es-AR")}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <a
                      href={`https://wa.me/${pedido.cliente_whatsapp}`}
                      target="_blank"
                      className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-neo shadow-lg shadow-emerald-500/20 transition-all active:scale-90"
                      title="Contactar al cliente"
                    >
                      <ExternalLink size={20} />
                    </a>
                    <button className="p-3 bg-bg-main dark:bg-bg-darker border-2 border-border dark:border-border-dark text-text-muted hover:text-primary hover:border-primary rounded-neo transition-all active:scale-90">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
