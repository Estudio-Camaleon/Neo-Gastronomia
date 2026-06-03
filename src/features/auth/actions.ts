"use server";

import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/core/lib/supabase/admin";
import { loginSchema, registerSchema } from "@/core/lib/schemas";

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
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message || "Datos de acceso inválidos.",
    };
  }
  const { email, password } = parsed.data;

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`login:${ip}`)) {
    return { error: "Demasiados intentos. Intentalo de nuevo en un minuto." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
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
  whatsapp?: string;
  descripcion?: string;
}) {
  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message || "Datos de registro inválidos.",
    };
  }

  const { email, password, nombreNegocio, whatsapp, descripcion } = parsed.data;

  const safeNombre = nombreNegocio.trim().replace(/<[^>]*>/g, "");
  const safeWhatsapp = (whatsapp || "").trim();
  const safeDescripcion = (descripcion || "").trim().replace(/<[^>]*>/g, "");

  if (safeNombre.length < 2) {
    return { error: "El nombre comercial debe tener al menos 2 caracteres." };
  }

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`register:${ip}`, 3)) {
    return { error: "Demasiados intentos. Intentalo de nuevo en un minuto." };
  }

  // Crear usuario confirmado via admin client (bypassea config de confirmación)
  const { data: authData, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre_negocio: safeNombre },
    });

  console.log("[NEO REGISTER DEBUG]: createUser result", {
    userId: authData?.user?.id,
    userEmail: authData?.user?.email,
    createError: createError?.message,
  });

  if (createError) return { error: createError.message };
  if (!authData.user) return { error: "No se pudo crear el usuario." };

  // Iniciar sesión para establecer cookies de sesión
  const supabase = await createClient();
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log("[NEO REGISTER DEBUG]: signInWithPassword result", {
    userId: signInData?.user?.id,
    sessionExists: !!signInData?.session,
    signInError: signInError?.message,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  let slug = safeNombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, "")
    || `local-${authData.user.id.slice(0, 8)}`;

  const { data: existing } = await supabaseAdmin
    .from("negocios")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    const suffix = Math.random().toString(36).slice(2, 6);
    slug = `${slug}-${suffix}`;
  }

  const { error: negocioError } = await supabaseAdmin.from("negocios").insert({
    user_id: authData.user.id,
    nombre: safeNombre,
    slug,
    ...(safeWhatsapp ? { whatsapp: safeWhatsapp } : {}),
    ...(safeDescripcion ? { descripcion: safeDescripcion } : {}),
  });

  if (negocioError) {
    return {
      error: `No se pudo crear el negocio: ${negocioError.message}. Contactá a soporte.`,
    };
  }

  revalidatePath("/", "layout");
  redirect("/configuracion?firstLogin=true");
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
