"use server";

import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAction(payload: {
  email: string;
  password: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "El correo electrónico o la contraseña son incorrectos."
          : error.message,
    };
  }

  // Refrescamos caché y redirigimos fuera del bloque catch para evitar errores de Next.js
  revalidatePath("/", "layout");
  redirect("/pedidos");
}

export async function registerAction(payload: {
  email: string;
  password: string;
  nombreNegocio: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      // Importante: La URL debe apuntar al callback de auth, no directo a /pedidos
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      data: {
        nombre_negocio: payload.nombreNegocio,
      },
    },
  });

  if (error) return { error: error.message };

  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
