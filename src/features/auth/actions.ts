"use server";

import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/core/lib/supabase/admin";

// --- RATE LIMITER SIMPLE (en memoria) ---
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60000,
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count++;
  return true;
}

export async function loginAction(payload: {
  email: string;
  password: string;
}) {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`login:${ip}`)) {
    return { error: "Demasiados intentos. Intentalo de nuevo en un minuto." };
  }

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

  revalidatePath("/", "layout");
  redirect("/pedidos");
}

export async function registerAction(payload: {
  email: string;
  password: string;
  nombreNegocio: string;
}) {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`register:${ip}`, 3)) {
    return { error: "Demasiados intentos. Intentalo de nuevo en un minuto." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/callback`,
      data: {
        nombre_negocio: payload.nombreNegocio,
      },
    },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "No se pudo crear el usuario." };

  const slug = payload.nombreNegocio
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const { error: negocioError } = await supabaseAdmin
    .from("negocios")
    .insert({
      user_id: data.user.id,
      nombre: payload.nombreNegocio.trim(),
      slug: slug || `local-${data.user.id.slice(0, 8)}`,
    });

  if (negocioError) {
    console.error("[REGISTER]: Error creando negocio:", negocioError.message);
  }

  return { success: true };
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/callback`,
    },
  });

  if (error) throw new Error(error.message);

  redirect(data.url);
}

export async function resetPasswordAction(email: string) {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`reset:${ip}`, 3)) {
    return { error: "Demasiados intentos. Intentalo de nuevo en un minuto." };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/callback?type=recovery`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
