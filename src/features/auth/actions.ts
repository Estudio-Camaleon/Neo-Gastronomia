"use server";

import { createClient } from "@/core/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/core/lib/supabase/admin";
import { z } from "zod";
import { loginSchema, registerSchema } from "@/core/lib/schemas";
import { checkRateLimit } from "@/core/lib/rate-limit";

const SUPABASE_SAFE_ERRORS: Record<string, string> = {
  "Invalid login credentials":
    "El correo electrónico o la contraseña son incorrectos.",
  "Email not confirmed":
    "El correo electrónico no está verificado. Revisá tu bandeja de entrada.",
  "User is banned": "La cuenta ha sido desactivada. Contactá a soporte.",
  "Email rate limit exceeded":
    "Demasiados intentos. Esperá unos minutos y volvé a intentar.",
  "User already registered":
    "El correo electrónico ya está registrado.",
  "Signup requires a valid password":
    "La contraseña no cumple con los requisitos de seguridad.",
  "Password should be at least 6 characters":
    "La contraseña debe tener al menos 8 caracteres.",
  "new password should be different from the old password":
    "La nueva contraseña debe ser diferente a la anterior.",
};

function sanitizeAuthError(errorMessage: string): string {
  return SUPABASE_SAFE_ERRORS[errorMessage] ?? errorMessage;
}

export async function loginAction(payload: {
  email: string;
  password: string;
}) {
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Datos de acceso inválidos.",
    };
  }
  const { email, password } = parsed.data;

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!(await checkRateLimit(`login:${ip}`))) {
    return { error: "Demasiados intentos. Intentalo de nuevo en un minuto." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: sanitizeAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/pedidos");
}

export async function checkDuplicateAction(field: string, value: string) {
  // Solo chequea nombre/slug/whatsapp para evitar email enumeration
  if (field === "email") return { exists: false };

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!(await checkRateLimit(`check:${ip}`, 30))) {
    return { error: "Demasiadas solicitudes. Intentalo de nuevo." };
  }

  try {
    const { data: resultados } = await supabaseAdmin
      .from("negocios")
      .select("id")
      .eq(field === "nombre" ? "nombre" : field, value)
      .limit(1);
    return { exists: !!resultados?.[0] };
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
      error: parsed.error.issues[0]?.message || "Datos de registro inválidos.",
    };
  }

  const {
    email,
    password,
    nombreNegocio,
    slug,
    whatsapp,
    direccion,
    color_primary,
  } = parsed.data;

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!(await checkRateLimit(`register:${ip}`, 5))) {
    return { error: "Demasiados intentos. Intentalo de nuevo en un minuto." };
  }

  // Verificar duplicados (server-side)
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
    return { error: sanitizeAuthError(createError.message) };
  }
  if (!authData.user) return { error: "No se pudo crear el usuario." };

  // Iniciar sesión
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: sanitizeAuthError(signInError.message) };
  }

  const { error: negocioError } = await supabase.from("negocios").insert({
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
  if (!(await checkRateLimit(`reset:${ip}`, 3))) {
    return { error: "Demasiados intentos. Intentalo de nuevo en un minuto." };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/callback?type=recovery`,
  });

  if (error) return { error: sanitizeAuthError(error.message) };
  return { success: true };
}

const updatePasswordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
  .regex(/[0-9]/, "Debe incluir al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un símbolo");

export async function updatePasswordAction(newPassword: string) {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!(await checkRateLimit(`update-password:${ip}`, 5))) {
    return { error: "Demasiados intentos. Intentalo de nuevo en un minuto." };
  }

  const parsed = updatePasswordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Contraseña inválida.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) return { error: sanitizeAuthError(error.message) };
  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
