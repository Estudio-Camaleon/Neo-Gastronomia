"use server";

import { createClient } from "@/core/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedTenant } from "@/core/lib/tenant";
import { upsertProductSchema } from "@/core/lib/schemas";
import { z } from "zod";
import type { ProductoConfiguracion } from "@/core/types/domain";

export async function upsertProductAction(
  payload: z.infer<typeof upsertProductSchema>,
  productId?: string,
) {
  const parsed = upsertProductSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new Error(
      `Datos inválidos: ${firstIssue.path.join(".")} - ${firstIssue.message}`,
    );
  }

  const supabase = await createClient();
  const tenantId = await getAuthenticatedTenant(supabase);

  const productRow = {
    nombre: parsed.data.nombre,
    descripcion: parsed.data.descripcion ?? null,
    precio: parsed.data.precio,
    imagen_url: parsed.data.imagen_url ?? null,
    categoria_id: parsed.data.categoria_id ?? null,
    disponible: parsed.data.disponible,
    configuracion: parsed.data.configuracion,
    negocio_id: tenantId,
    ...(productId ? { id: productId } : {}),
  };

  const { error } = await supabase.from("productos").upsert(productRow);

  if (error) throw new Error(`Fallo de persistencia: ${error.message}`);

  revalidatePath("/productos");
  return { success: true };
}

const deleteProductSchema = z.string().min(1, "ID de producto requerido");

export async function deleteProductAction(productId: string) {
  const parsed = deleteProductSchema.safeParse(productId);
  if (!parsed.success) throw new Error("ID de producto inválido");

  const supabase = await createClient();
  const tenantId = await getAuthenticatedTenant(supabase);

  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id", parsed.data)
    .eq("negocio_id", tenantId);

  if (error) throw new Error(error.message);

  revalidatePath("/productos");
  return { success: true };
}

const createCategorySchema = z.object({
  nombre: z.string().min(1, "Nombre de categoría requerido"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug inválido: solo minúsculas, números y guiones"),
});

export async function createCategoryAction(nombre: string, slug: string) {
  const parsed = createCategorySchema.safeParse({ nombre, slug });
  if (!parsed.success) throw new Error("Datos de categoría inválidos");

  const supabase = await createClient();
  const tenantId = await getAuthenticatedTenant(supabase);

  const { error } = await supabase.from("categorias").insert({
    nombre: parsed.data.nombre,
    slug: parsed.data.slug,
    negocio_id: tenantId,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/productos");
  return { success: true };
}
