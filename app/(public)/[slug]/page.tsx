import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicNavbar } from "@/components/menu/PublicNavbar";
import { MenuCard } from "@/components/menu/MenuCard";
import { PublicCart } from "@/components/menu/PublicCart";
import { CartFloatingButton } from "@/components/menu/CartFloatingButton";

export default async function PublicMenuPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: negocio } = await supabase
    .from("negocios")
    .select("*, productos(*)")
    .eq("slug", slug)
    .single();

  if (!negocio) notFound();

  // Agrupar productos por categoría
  const productosPorCategoria = negocio.productos?.reduce(
    (acc: any, prod: any) => {
      const cat = prod.categoria || "Menú Principal";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(prod);
      return acc;
    },
    {},
  );

  const categorias = Object.keys(productosPorCategoria || {});

  const brandStyles = {
    "--brand-color": negocio.color_primario || "#E60000",
    "--bg-public": negocio.color_fondo || "#FFFFFF",
    "--text-public": negocio.color_texto || "#1A1A1A",
  } as React.CSSProperties;

  return (
    <main
      style={brandStyles}
      className="min-h-screen bg-[var(--bg-public)] font-montserrat pb-32"
    >
      <PublicNavbar logo={negocio.logo_url} nombre={negocio.nombre} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1 w-full">
            <header className="mb-12 text-center lg:text-left">
              <h1 className="text-4xl font-black text-[var(--text-public)] tracking-tighter italic uppercase">
                {negocio.nombre}
              </h1>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brand-color)]/10 text-[var(--brand-color)] text-[10px] font-black uppercase tracking-[0.15em]">
                <span className="w-2 h-2 rounded-full bg-[var(--brand-color)] animate-pulse" />
                Abierto ahora · Pedí por WhatsApp
              </div>
            </header>

            {/* Renderizado de Categorías */}
            <div className="space-y-16">
              {categorias.map((cat) => (
                <section key={cat}>
                  <h2 className="text-xl font-black text-[var(--text-public)] uppercase tracking-[0.2em] mb-8 flex items-center gap-4">
                    <span className="w-10 h-[3px] bg-[var(--brand-color)]" />
                    {cat}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                    {productosPorCategoria[cat].map((prod: any) => (
                      <MenuCard key={prod.id} {...prod} id={prod.id} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          {/* Carrito Lateral (Desktop) */}
          <div className="hidden lg:block sticky top-28">
            <PublicCart />
          </div>
        </div>
      </div>

      <CartFloatingButton whatsapp={negocio.whatsapp} />
    </main>
  );
}
