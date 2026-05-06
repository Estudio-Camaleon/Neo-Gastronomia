import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicNavbar } from "@/components/menu/ui/public-navbar";
import { MenuWrapper } from "@/components/menu/MenuWrapper";

// OPTIMIZACIÓN CRÍTICA: Forzamos a Next.js a bypassear la caché estática y leer en vivo
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PublicPageProps {
  params: Promise<{ slug: string }>;
}

interface HorarioDia {
  inicio?: string;
  fin?: string;
}

/**
 * Función auxiliar encargada de transformar el objeto jsonb de Supabase
 * en texto resumido legible para la carga inicial del componente público.
 */
function obtenerHorarioFormateado(horariosRaw: unknown): {
  rango: string;
  dias: string;
} {
  if (
    !horariosRaw ||
    typeof horariosRaw !== "object" ||
    Array.isArray(horariosRaw)
  ) {
    return { rango: "Cerrado", dias: "Consulte horarios" };
  }

  const horarios = horariosRaw as Record<string, HorarioDia | undefined>;
  const diasSemana = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];
  const diasActivos: string[] = [];
  let primerRangoEncontrado = "";

  // Barremos la semana en orden lógico para verificar qué días tienen rangos activos
  diasSemana.forEach((dia) => {
    const infoDia = horarios[dia];
    if (infoDia && infoDia.inicio && infoDia.fin) {
      diasActivos.push(dia);
      if (!primerRangoEncontrado) {
        primerRangoEncontrado = `${infoDia.inicio} - ${infoDia.fin}`;
      }
    }
  });

  // Si el comercio no tiene tildado ningún día operativo en el panel de administración
  if (diasActivos.length === 0) {
    return { rango: "Cerrado", dias: "Sin horarios configurados" };
  }

  // Traducción estética ultra corta para el subtexto de la UI (Ej: "lunes" -> "Lu")
  const traducirDia = (d: string) => d.charAt(0).toUpperCase() + d.slice(1, 3);

  let diasTexto = "Días variados";
  if (diasActivos.length === 7) {
    diasTexto = "Lun - Dom";
  } else if (diasActivos.length > 1) {
    diasTexto = `${traducirDia(diasActivos[0])} - ${traducirDia(diasActivos[diasActivos.length - 1])}`;
  } else if (diasActivos.length === 1) {
    diasTexto = traducirDia(diasActivos[0]);
  }

  return {
    rango: primerRangoEncontrado || "Cerrado",
    dias: diasTexto,
  };
}

export default async function PublicMenuPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Traemos el registro completo del negocio sincronizando sus relaciones en una sola consulta relacional
  const { data: negocio, error } = await supabase
    .from("negocios")
    .select(
      `
      id,
      nombre,
      slug,
      color_primary,
      banner_url,
      logo_url,
      direccion,
      whatsapp,
      horarios,
      categorias (
        id,
        nombre,
        slug,
        productos (
          id,
          nombre,
          descripcion,
          precio,
          imagen_url,
          disponible
        )
      )
    `,
    )
    .eq("slug", slug.toLowerCase())
    .single();

  // Control de fallos: Si da error o el slug no mapea con nada en la BD, disparamos el 404 nativo
  if (error || !negocio) {
    return notFound();
  }

  // Parseamos los rangos de la base de datos de forma dinámica para el fallback del Navbar
  const infoHorario = obtenerHorarioFormateado(negocio.horarios);
  const categoriasFormateadas = negocio.categorias || [];

  return (
    <div className="w-full min-h-screen pb-24">
      {/* 1. NAVBAR DE MARCA ESTILO MOCKUP (OCUPA EL 100% DEL ANCHO) */}
      <PublicNavbar
        nombre={negocio.nombre}
        logoUrl={negocio.logo_url}
        bannerUrl={negocio.banner_url}
        direccion={negocio.direccion}
        colorConfig={negocio.color_primary || "#1c7a42"}
        horariosRaw={negocio.horarios} // Con esto ya le alcanza para armar todo el reloj y el dropdown
      />

      {/* 2. ORQUESTADOR INTERACTIVO DEL CATÁLOGO DE PRODUCTOS (PROTEGIDO EN EL CENTRO) */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <MenuWrapper
          negocioId={negocio.id}
          categorias={categoriasFormateadas}
          colorConfig={negocio.color_primary || "#1c7a42"}
        />
      </div>
    </div>
  );
}
