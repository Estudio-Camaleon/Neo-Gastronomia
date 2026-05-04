import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicNavbar } from "@/components/menu/PublicNavbar";
import { MenuCard } from "@/components/menu/MenuCard";
import { PublicCart } from "@/components/menu/PublicCart";
import { CartFloatingButton } from "@/components/menu/CartFloatingButton";
import { estaAbierto } from "@/lib/utils/horarios";

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>; // Next.js 15
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Consulta optimizada según tu tabla 'negocios' y 'productos'
  const { data: negocio } = await supabase
    .from("negocios")
    .select(
      `
      *,
      productos (
        *,
        categorias (nombre)
      )
    `,
    )
    .eq("slug", slug)
    .single();

  if (!negocio) notFound();

  // 2. Lógica de Horarios usando tu columna 'horarios' (jsonb)
  const localAbierto = estaAbierto(negocio.horarios);

  // 3. Agrupación por Categorías (Normalizada)
  const productosPorCategoria = negocio.productos?.reduce(
    (acc: any, prod: any) => {
      const cat = prod.categorias?.nombre || "Menú Principal";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(prod);
      return acc;
    },
    {},
  );

  const categorias = Object.keys(productosPorCategoria || {});

  // 4. Variables de Branding Dinámico (Usando tus columnas de DB)
  const brandStyles = {
    "--brand-color": negocio.color_primario || "#000000",
    "--bg-public": "#FFFFFF", // Podrías añadir color_fondo a tu SQL luego si querés
    "--text-public": "#1A1A1A",
  } as React.CSSProperties;

  return (
    <main
      style={brandStyles}
      className="min-h-screen bg-[var(--bg-public)] font-montserrat pb-32 selection:bg-[var(--brand-color)] selection:text-white"
    >
      {/* Navbar con el logo y nombre de tu tabla */}
      <PublicNavbar
        logo={negocio.logo_url}
        nombre={negocio.nombre}
        horarios={negocio.horarios}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1 w-full space-y-16">
            <header className="mb-12 text-center lg:text-left space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-[var(--text-public)] tracking-tighter italic uppercase leading-none">
                {negocio.nombre}
              </h1>

              {/* Dirección física de tu tabla public.negocios */}
              {negocio.direccion && (
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  {negocio.direccion}
                </p>
              )}

              {/* Status de Horario Dinámico */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black uppercase tracking-[0.15em] text-[10px] border-2 ${
                  localAbierto
                    ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10"
                    : "bg-red-500/5 text-red-600 border-red-500/10"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${localAbierto ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
                />
                {localAbierto
                  ? "Abierto · Pedí por WhatsApp"
                  : "Local Cerrado · Consultá horarios"}
              </div>
            </header>

            {/* Listado de Categorías */}
            <div className="space-y-20">
              {categorias.map((cat) => (
                <section
                  key={cat}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                >
                  <h2 className="text-xl font-black text-[var(--text-public)] uppercase tracking-[0.2em] mb-8 flex items-center gap-4 italic">
                    <span className="w-10 h-[3px] bg-[var(--brand-color)]" />
                    {cat}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                    {productosPorCategoria[cat].map((prod: any) => (
                      <MenuCard
                        key={prod.id}
                        {...prod}
                        isClosed={!localAbierto}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          {/* Carrito Lateral Desktop (Sticky) */}
          <aside className="hidden lg:block sticky top-28 w-[380px]">
            <PublicCart isClosed={!localAbierto} negocioId={negocio.id} />
          </aside>
        </div>
      </div>

      {/* Botón Flotante Móvil */}
      <CartFloatingButton
        whatsapp={negocio.whatsapp}
        disabled={!localAbierto}
      />
    </main>
  );
}
