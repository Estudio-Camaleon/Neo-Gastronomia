"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Replicamos las interfaces para tipar el JSONB estrictamente y evitar el "any"
interface Variant {
  nombre: string;
  precio: number;
}

interface ExtraItem {
  id: string;
  nombre: string;
  precio: number;
}

interface ExtraGroup {
  id: string;
  titulo: string;
  requerido: boolean;
  multiple: boolean;
  items: ExtraItem[];
}

interface ProductoPayload {
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  categoria_id: string | null;
  disponible: boolean;
  // 1. CHAU ANY: Tipamos la configuración exactamente como es
  configuracion: {
    variantes?: Variant[];
    grupo_extras?: ExtraGroup[];
  } | null;
}

export async function guardarProducto(
  negocioId: string,
  payload: ProductoPayload,
  productoId?: string,
) {
  try {
    const dataToSave = {
      ...payload,
      negocio_id: negocioId,
    };

    let result;

    if (productoId) {
      result = await supabaseAdmin
        .from("productos")
        .update(dataToSave)
        .eq("id", productoId)
        .eq("negocio_id", negocioId);
    } else {
      result = await supabaseAdmin.from("productos").insert(dataToSave);
    }

    if (result.error) {
      console.error("Error al guardar producto:", result.error);
      return { success: false, error: result.error.message };
    }

    revalidatePath("/(adminPanel)/productos", "page");

    return { success: true };

    // 2. CHAU ANY: Usamos "unknown" que es el estándar estricto en TypeScript para los Catch
  } catch (error: unknown) {
    console.error("Excepción en guardarProducto:", error);

    // Verificamos si el error es una instancia nativa de Error para extraer su mensaje
    const errorMessage =
      error instanceof Error ? error.message : "Error interno del servidor";

    return { success: false, error: errorMessage };
  }
}
