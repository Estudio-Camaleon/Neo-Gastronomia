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
  params: Promise<{ slug: string }>; // Next.js 15: params es una Promesa
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Consulta blindada: Traemos negocio y sus productos con categoría
  const { data: negocio, error } = await supabase
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

  // Si no hay negocio o el slug está mal, 404 de una
  if (error || !negocio) notFound();

  // 2. Lógica de Apertura (Server Side)
  const localAbierto = estaAbierto(negocio.horarios);

  // 3. Agrupación y filtrado (Solo productos con disponible: true)
  const productosPorCategoria = negocio.productos
    ?.filter((p: any) => p.disponible) // SEGURIDAD: Solo lo que hay en stock
    .reduce((acc: any, prod: any) => {
      const cat = prod.categorias?.nombre || "Nuestras Joyas";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(prod);
      return acc;
    }, {});

  const categorias = Object.keys(productosPorCategoria || {});

  // 4. Inyección de Branding NEO
  const brandStyles = {
    "--brand-color": negocio.color_primario || "#1c7a42",
    "--bg-public": negocio.color_fondo || "#f5f7f6",
    "--text-public": negocio.color_texto || "#282d2a",
  } as React.CSSProperties;

  return (
    <main
      style={brandStyles}
      className="min-h-screen bg-[var(--bg-public)] pb-32 selection:bg-primary selection:text-white"
    >
      <PublicNavbar
        logo={negocio.logo_url}
        nombre={negocio.nombre}
        horarios={negocio.horarios}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="flex-1 w-full space-y-20">
            {/* Header de Impacto */}
            <header className="text-center lg:text-left space-y-6">
              <h1 className="text-6xl md:text-8xl font-black text-[var(--text-public)] tracking-[calc(-0.05em)] italic uppercase leading-none">
                {negocio.nombre}
              </h1>

              <div
                className={`inline-flex items-center gap-3 px-6 py-2 rounded-full font-black uppercase tracking-[0.2em] text-[10px] border-2 transition-all duration-500 ${
                  localAbierto
                    ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                    : "bg-error/5 text-error border-error/20 opacity-70"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${localAbierto ? "bg-emerald-500 animate-pulse" : "bg-error"}`}
                />
                {localAbierto ? "Servicio Activo" : "Local fuera de horario"}
              </div>
            </header>

            {/* Categorías & Menú */}
            <div className="space-y-24">
              {categorias.length > 0 ? (
                categorias.map((cat) => (
                  <section
                    key={cat}
                    className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                  >
                    <h2 className="text-2xl font-black text-[var(--text-public)] uppercase tracking-[0.25em] mb-10 flex items-center gap-6 italic">
                      <span className="w-12 h-[4px] bg-[var(--brand-color)] rounded-full" />
                      {cat}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                      {productosPorCategoria[cat].map((prod: any) => (
                        <MenuCard
                          key={prod.id}
                          {...prod}
                          isClosed={!localAbierto}
                          brandColor="var(--brand-color)"
                        />
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-border rounded-super">
                  <p className="text-text-muted font-black uppercase italic tracking-widest">
                    El menú está siendo actualizado...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Carrito Lateral (Desktop) - NEO STICKY */}
          <aside className="hidden lg:block sticky top-32 w-[380px] animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white dark:bg-bg-darker rounded-super border-2 border-border dark:border-border-dark p-1 shadow-2xl shadow-primary/5">
              <PublicCart isClosed={!localAbierto} negocioId={negocio.id} />
            </div>
          </aside>
        </div>
      </div>

      <CartFloatingButton
        whatsapp={negocio.telefono_whatsapp}
        disabled={!localAbierto}
      />
    </main>
  );
}
