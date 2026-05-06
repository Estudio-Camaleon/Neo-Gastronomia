import { createClient } from "@/lib/supabase/server";

interface PublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug?: string }>; // Captura asíncrona de parámetros de ruta en Next.js moderno
}

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  // 1. Extraemos el slug actual de la URL de forma segura
  const { slug } = await params;
  let brandColor = "#f59e0b"; // Color ámbar neo-brutalista por defecto (fallback)

  // 2. Si el cliente está navegando una ruta con slug válido, extraemos su configuración
  if (slug) {
    const supabase = await createClient();
    const { data: negocio } = await supabase
      .from("negocios")
      .select("color_primary")
      .eq("slug", slug)
      .single();

    if (negocio?.color_primary) {
      brandColor = negocio.color_primary;
    }
  }

  return (
    // Inyectamos la propiedad CSS en línea para que Tailwind la muerda dinámicamente desde el config
    <div
      style={{ "--custom-brand-color": brandColor } as React.CSSProperties}
      className="min-h-screen bg-bg-main dark:bg-bg-dark transition-colors duration-300 font-sans"
    >
      <main className="w-full h-full">{children}</main>
    </div>
  );
}
