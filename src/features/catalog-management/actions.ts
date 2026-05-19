"use server";

import { createClient } from "@/core/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SupabaseClient } from "@supabase/supabase-js";

export interface JSONBExtraItem {
  id: string;
  nombre: string;
  precio: number;
}

export interface JSONBExtraGroup {
  id: string;
  titulo: string;
  requerido: boolean;
  multiple: boolean;
  items: JSONBExtraItem[];
}

export interface ProductoConfiguracion {
  variantes: Array<{ nombre: string; precio: number }>;
  grupos_opciones: JSONBExtraGroup[];
}

interface UpsertProductPayload {
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  categoria_id: string | null;
  disponible: boolean;
  configuracion: ProductoConfiguracion;
}

async function getAuthenticatedTenant(supabase: SupabaseClient) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Acceso no autorizado.");

  const { data: negocio, error: tenantError } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (tenantError || !negocio)
    throw new Error("Inconsistencia Multi-tenant: Local no asignado.");
  return negocio.id;
}

export async function upsertProductAction(
  payload: UpsertProductPayload,
  productId?: string,
) {
  const supabase = await createClient();
  const tenantId = await getAuthenticatedTenant(supabase);

  const productRow = {
    nombre: payload.nombre,
    descripcion: payload.descripcion,
    precio: payload.precio,
    imagen_url: payload.imagen_url,
    categoria_id: payload.categoria_id,
    disponible: payload.disponible,
    configuracion: payload.configuracion,
    negocio_id: tenantId,
    ...(productId ? { id: productId } : {}),
  };

  const { error } = await supabase.from("productos").upsert(productRow);

  if (error) throw new Error(`Fallo de persistencia: ${error.message}`);

  revalidatePath("/productos");
  return { success: true };
}

export async function deleteProductAction(productId: string) {
  const supabase = await createClient();
  const tenantId = await getAuthenticatedTenant(supabase);

  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id", productId)
    .eq("negocio_id", tenantId);

  if (error) throw new Error(error.message);

  revalidatePath("/productos");
  return { success: true };
}

export async function createCategoryAction(nombre: string, slug: string) {
  const supabase = await createClient();
  const tenantId = await getAuthenticatedTenant(supabase);

  const { error } = await supabase
    .from("categorias")
    .insert({ nombre, slug, negocio_id: tenantId });

  if (error) throw new Error(error.message);

  revalidatePath("/productos");
  return { success: true };
}
