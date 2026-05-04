"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * REGISTRO DE NUEVO USUARIO Y NEGOCIO
 */
export async function registerUserAction(formData: any) {
  const supabase = await createClient();

  const { email, password, nombreNegocio } = formData;

  // 1. Registro en Supabase Auth
  // Enviamos 'nombre_negocio' en metadata para que el Trigger de SQL
  // cree la fila en la tabla 'negocios' automáticamente.
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      data: {
        nombre_negocio: nombreNegocio,
      },
    },
  });

  if (authError) {
    return { success: false, message: authError.message };
  }

  return {
    success: true,
    message: "Revisa tu email para confirmar la cuenta.",
  };
}

/**
 * INICIO DE SESIÓN
 */
export async function loginUserAction(formData: any) {
  const supabase = await createClient();

  const { email, password } = formData;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: "Credenciales inválidas" };
  }

  // Revalidamos para que el layout detecte la nueva sesión
  revalidatePath("/", "layout");
  redirect("/pedidos");
}

/**
 * CIERRE DE SESIÓN
 */
export async function logoutAction() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, message: "Error al cerrar sesión" };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * RECUPERACIÓN DE CONTRASEÑA
 */
export async function resetPasswordAction(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Email de recuperación enviado." };
}
