import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Package, ExternalLink, MoreVertical } from "lucide-react";

// Componentes de Cliente para interactividad
import { TestOrderButton } from "@/components/adminPanel/TestOrderButton";
import { RealtimeOrders } from "@/components/adminPanel/RealtimeOrders";

export default async function PedidosPage() {
  const supabase = await createClient();

  // 1. Obtenemos el usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Traemos los datos del negocio y sus pedidos
  // Usamos inner join para asegurar que el negocio pertenece al usuario
  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select(
      `
      *,
      negocios!inner(id, user_id, nombre),
      pedido_items(*)
    `,
    )
    .eq("negocios.user_id", user?.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-red-500 font-bold bg-red-500/10 rounded-2xl border border-red-500/20">
        Error al cargar los pedidos. Por favor, intenta de nuevo.
      </div>
    );
  }

  // Obtenemos el ID del negocio (necesario para el oyente Realtime)
  const negocioId = pedidos?.[0]?.negocios?.id || "";
  const nombreNegocio = pedidos?.[0]?.negocios?.nombre || "tu negocio";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "en_preparacion":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "enviado":
        return "bg-primary/10 text-primary dark:bg-primary/20";
      case "entregado":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen pb-32">
      {/* OYENTE EN TIEMPO REAL: Dispara sonido y notificaciones visuales */}
      {negocioId && <RealtimeOrders negocioId={negocioId} />}

      {/* BOTÓN DE PRUEBA: Para simular pedidos */}
      <TestOrderButton />

      {/* Header del Dashboard */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-text-primary dark:text-text-inverse tracking-tighter uppercase">
            Pedidos{" "}
            <span className="text-primary text-sm ml-2 font-black tracking-widest">
              LIVE
            </span>
          </h1>
          <p className="text-text-muted text-sm font-medium">
            Gestionando las órdenes de{" "}
            <span className="text-primary font-bold">{nombreNegocio}</span> en
            tiempo real.
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase font-black text-text-muted tracking-widest">
            Total Facturado Hoy
          </p>
          <p className="text-2xl font-black text-text-primary dark:text-text-inverse">
            $
            {pedidos
              ?.reduce((acc, p) => acc + (Number(p.total) || 0), 0)
              .toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      {/* Grid de Pedidos */}
      <div className="grid gap-4">
        {pedidos?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border dark:border-border-dark rounded-[32px] bg-surface/50 dark:bg-surface-dark/30">
            <div className="bg-bg-main dark:bg-bg-dark p-6 rounded-full mb-4 shadow-xl">
              <Package className="w-12 h-12 text-primary opacity-40" />
            </div>
            <p className="text-text-muted font-black text-xl uppercase tracking-tighter">
              Sin pedidos entrantes
            </p>
            <p className="text-text-muted text-sm mt-1">
              Cuando un cliente realice una compra, aparecerá aquí con un aviso
              sonoro.
            </p>
          </div>
        ) : (
          pedidos?.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl p-5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group"
            >
              <div className="flex flex-wrap md:flex-nowrap justify-between gap-6">
                {/* Columna 1: Estado y Cliente */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${getStatusColor(pedido.estado)}`}
                    >
                      {pedido.estado.replace("_", " ")}
                    </span>
                    <span className="text-text-muted text-xs font-bold">
                      {format(new Date(pedido.created_at), "HH:mm 'hs'", {
                        locale: es,
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-text-primary dark:text-text-inverse tracking-tight">
                    {pedido.cliente_nombre}
                  </h3>
                  <p className="text-sm text-text-muted font-medium truncate max-w-xs">
                    📍 {pedido.direccion_entrega || "Retiro en local"}
                  </p>
                  {pedido.notas && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1 italic">
                      " {pedido.notas} "
                    </p>
                  )}
                </div>

                {/* Columna 2: Detalle de Productos (Comanda) */}
                <div className="flex-[2] border-x border-border dark:border-border-dark px-6 hidden lg:block">
                  <p className="text-[10px] uppercase font-black text-text-muted mb-3 tracking-widest opacity-60">
                    Comanda / Items
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pedido.pedido_items?.map((item: any) => (
                      <span
                        key={item.id}
                        className="text-[11px] font-bold bg-bg-main dark:bg-bg-darker px-3 py-1.5 rounded-lg border border-border dark:border-border-dark text-text-primary dark:text-text-inverse shadow-sm"
                      >
                        <span className="text-primary mr-1">
                          {item.cantidad}x
                        </span>{" "}
                        {item.nombre_producto}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Columna 3: Total y Acciones */}
                <div className="flex flex-col items-end justify-between min-w-[140px]">
                  <p className="text-2xl font-black text-primary tracking-tighter">
                    ${Number(pedido.total).toLocaleString("es-AR")}
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/${pedido.cliente_whatsapp}`}
                      target="_blank"
                      className="p-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl transition-all duration-300"
                      title="Contactar al cliente"
                    >
                      <ExternalLink size={20} />
                    </a>
                    <button className="p-3 bg-bg-main dark:bg-bg-darker hover:bg-border text-text-muted rounded-xl transition-all">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
