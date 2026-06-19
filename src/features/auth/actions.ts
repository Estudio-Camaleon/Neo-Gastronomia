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

const NOMBRE_SUFFIXES = [
  "Pro", "Online", "Express", "Digital", "Directo", "Ya",
  "Web", "Market", "Premium", "Full", "Total", "Max",
  "Top", "Plus", "GO", "Net", "Easy", "Fast", "Smart", "Prime",
];

export async function checkDuplicateAction(field: string, value: string) {
  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!(await checkRateLimit(`check:${ip}`, 30))) {
    return { error: "Demasiadas solicitudes. Intentalo de nuevo." };
  }

  const cleanValue = value.replace(/\s+/g, " ").trim();

  if (!cleanValue) return { exists: false };

  try {
    if (field === "email") {
      try {
        const { data: usuarios, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) return { exists: false };
        const found = usuarios?.users?.some((u) => (u.email ?? "").toLowerCase() === cleanValue.toLowerCase());
        return { exists: !!found };
      } catch {
        return { exists: false };
      }
    }

    const column = field === "nombre" ? "nombre" : field;
    // Normalizar espacios en la búsqueda: colapsar espacios múltiples
    const searchValue = field === "nombre"
      ? cleanValue
      : cleanValue.replace(/\s+/g, "");
    const { data: resultados } = await supabaseAdmin
      .from("negocios")
      .select("id, nombre")
      .ilike(column, searchValue)
      .limit(1);
    const exists = !!resultados?.[0];
    let suggestions: string[] | undefined;

    if (exists && field === "nombre") {
      const baseName = cleanValue;
      const { data: similares } = await supabaseAdmin
        .from("negocios")
        .select("nombre")
        .ilike("nombre", `${baseName}%`)
        .limit(20);

      const existingNames = new Set((similares ?? []).map((n) => n.nombre.toLowerCase()));
      const pool = [...NOMBRE_SUFFIXES];
      const result: string[] = [];

      // shuffle pool
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      for (const suffix of pool) {
        if (result.length >= 3) break;
        const candidate = `${baseName} ${suffix}`;
        if (!existingNames.has(candidate.toLowerCase())) {
          result.push(candidate);
        }
      }

      // si no alcanzamos 3 con sufijos, completar con números aleatorios
      if (result.length < 3) {
        const seen = new Set(result.map((r) => r.toLowerCase()));
        for (let attempt = 0; attempt < 50; attempt++) {
          if (result.length >= 3) break;
          const num = Math.floor(Math.random() * 900) + 100;
          const candidate = `${baseName} ${num}`;
          const key = candidate.toLowerCase();
          if (!existingNames.has(key) && !seen.has(key)) {
            seen.add(key);
            result.push(candidate);
          }
        }
      }

      suggestions = result;
    }

    return { exists, ...(suggestions ? { suggestions } : {}) };
  } catch {
    return { exists: false };
  }
}

export async function registerAction(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  referralSource?: string;
  nombreNegocio: string;
  slug: string;
  whatsapp?: string;
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
    firstName,
    lastName,
    phone,
    referralSource,
    nombreNegocio,
    slug,
    whatsapp,
  } = parsed.data;

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  if (!(await checkRateLimit(`register:${ip}`, 5))) {
    return { error: "Demasiados intentos. Intentalo de nuevo en un minuto." };
  }

  // Comprobación explícita de email existente para dar feedback inmediato
  try {
    const { data: listResp, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (!listErr) {
      const exists = listResp?.users?.some((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
      if (exists) return { error: "El correo electrónico ya está registrado." };
    }
  } catch {
    // silencioso: en caso de fallo, dejamos que createUser maneje la validación
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

  const { data: phonesEncontrados } = await supabaseAdmin
    .from("negocios")
    .select("id")
    .eq("phone", phone)
    .limit(1);
  if (phonesEncontrados?.[0]) {
    return { error: "El celular ya está registrado por otro usuario." };
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

  // Enviar email de confirmación usando signUp (no admin.createUser)
  // El negocio se crea en el callback después de que el usuario confirme su email
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const negocioMeta = {
    nombre_negocio: nombreNegocio,
    slug,
    first_name: firstName,
    last_name: lastName,
    phone,
    referral_source: referralSource,
    ...(whatsapp ? { whatsapp } : {}),
  };

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/callback`,
      data: negocioMeta,
    },
  });

  if (signUpError) {
    // Si el error es "User already registered", dar mensaje claro
    if (
      signUpError.message.includes("already registered") ||
      signUpError.message.includes("already exists")
    ) {
      return { error: "El correo electrónico ya está registrado." };
    }
    return { error: sanitizeAuthError(signUpError.message) };
  }

  // No creamos sesión ni negocio acá — se hace en /callback tras confirmar email
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
