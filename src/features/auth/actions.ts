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
  maxAttempts = 10,
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

export async function checkDuplicateAction(field: string, value: string) {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`check:${ip}`, 30)) {
    return { error: "Demasiadas solicitudes. Intentalo de nuevo." };
  }

  try {
    if (field === "email") {
      const { data } = await supabaseAdmin.auth.admin.listUsers();
      const exists = data?.users.some(
        (u) => u.email?.toLowerCase() === value.toLowerCase(),
      );
      return { exists: !!exists };
    }

    if (field === "slug" || field === "nombre" || field === "whatsapp") {
      const { data: resultados } = await supabaseAdmin
        .from("negocios")
        .select("id")
        .eq(field === "nombre" ? "nombre" : field, value)
        .limit(1);
      return { exists: !!resultados?.[0] };
    }

    return { exists: false };
  } catch {
    return { exists: false };
  }
}

export async function registerAction(payload: {
  email: string;
  password: string;
  nombreNegocio: string;
  slug: string;
  whatsapp?: string;
  direccion?: string;
  color_primary?: string;
}) {
  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message || "Datos de registro inválidos.",
    };
  }

  const { email, password, nombreNegocio, slug, whatsapp, direccion, color_primary } = parsed.data;

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`register:${ip}`, 5)) {
    return { error: "Demasiados intentos. Intentalo de nuevo en un minuto." };
  }

  // Verificar duplicados (server-side, doble validación)
  const { data: existingEmail } = await supabaseAdmin.auth.admin.listUsers();
  if (existingEmail?.users.some((u) => u.email?.toLowerCase() === email)) {
    return { error: "El correo ya está registrado. Inicia sesión o usa otro correo." };
  }

  const { data: nombresEncontrados } = await supabaseAdmin
    .from("negocios")
    .select("id")
    .eq("nombre", nombreNegocio)
    .limit(1);
  if (nombresEncontrados?.[0]) {
    return { error: "El nombre del negocio ya está registrado." };
  }

  const { data: slugsEncontrados } = await supabaseAdmin
    .from("negocios")
    .select("id")
    .eq("slug", slug)
    .limit(1);
  if (slugsEncontrados?.[0]) {
    return { error: "El slug ya está en uso. Elegí otro." };
  }

  if (whatsapp) {
    const { data: whatsappsEncontrados } = await supabaseAdmin
      .from("negocios")
      .select("id")
      .eq("whatsapp", whatsapp)
      .limit(1);
    if (whatsappsEncontrados?.[0]) {
      return { error: "El número de WhatsApp ya está registrado." };
    }
  }

  // Crear usuario confirmado via admin client
  const { data: authData, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre_negocio: nombreNegocio },
    });

  if (createError) {
    if (createError.message.includes("already exists")) {
      return { error: "El correo ya está registrado. Inicia sesión." };
    }
    return { error: createError.message };
  }
  if (!authData.user) return { error: "No se pudo crear el usuario." };

  // Iniciar sesión
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  const { error: negocioError } = await supabaseAdmin.from("negocios").insert({
    user_id: authData.user.id,
    nombre: nombreNegocio,
    slug,
    color_primary,
    ...(whatsapp ? { whatsapp } : {}),
    ...(direccion ? { direccion } : {}),
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

export async function updatePasswordAction(newPassword: string) {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`update-password:${ip}`, 5)) {
    return { error: "Demasiados intentos. Intentalo de nuevo en un minuto." };
  }

  if (newPassword.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
