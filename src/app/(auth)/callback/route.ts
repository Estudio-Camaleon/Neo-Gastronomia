import { NextResponse } from "next/server";
import { createClient } from "@/core/lib/supabase/server";
import { supabaseAdmin } from "@/core/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { origin, searchParams } = url;
  const code = searchParams.get("code");
  const access_token = searchParams.get("access_token");
  const refresh_token = searchParams.get("refresh_token");
  const type = searchParams.get("type");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[AUTH CALLBACK]: Error exchanging code:", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=Fallo_de_validacion_de_correo`,
      );
    }
  } else if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) {
      console.error("[AUTH CALLBACK]: Error setting session:", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=Fallo_de_validacion_de_correo`,
      );
    }
  } else {
    return NextResponse.redirect(`${origin}/login?message=correo_validado`);
  }

  // Recovery flow → redirect to reset-password page
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Usar supabaseAdmin para evitar race conditions RLS
  const { data: negocios } = await supabaseAdmin
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  const negocio = negocios?.[0] ?? null;

  if (negocio) {
    return NextResponse.redirect(`${origin}/pedidos`);
  }

  // Extraer datos del negocio desde user_metadata (enviados en registerAction signUp)
  const meta = user.user_metadata ?? {};

  const nombreNegocio =
    (meta["nombre_negocio"] as string | undefined) ||
    (meta["full_name"]
      ? (meta["full_name"] as string).split(" ")[0] + "'s Local"
      : undefined) ||
    "Mi Local";

  const metaSlug = meta["slug"] as string | undefined;
  const metaWhatsapp = meta["whatsapp"] as string | undefined;
  const metaPhone = meta["phone"] as string | undefined;
  const metaReferralSource = meta["referral_source"] as string | undefined;

  const defaultSlug =
    metaSlug ||
    nombreNegocio
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)+/g, "") ||
    `local-${user.id.slice(0, 8)}`;

  let finalSlug = defaultSlug;

  // Reintentar con sufijo aleatorio si hay colisión de slug
  const MAX_RETRIES_CB = 3;
  let createError: { message: string } | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES_CB; attempt++) {
    if (attempt > 0) {
      const suffix = Math.random().toString(36).substring(2, 6);
      finalSlug = `${defaultSlug}-${suffix}`;
    }

    const { error: err } = await supabaseAdmin.from("negocios").insert({
      user_id: user.id,
      nombre: nombreNegocio,
      slug: finalSlug,
      ...(metaWhatsapp ? { whatsapp: metaWhatsapp } : {}),
      ...(metaPhone ? { phone: metaPhone } : {}),
      ...(metaReferralSource ? { referral_source: metaReferralSource } : {}),
    });

    if (!err) {
      createError = null;
      break;
    }
    createError = err;
    // Solo reintentar si es violación de unique constraint en slug
    if (
      !err.message.includes("duplicate key") ||
      !err.message.includes("slug")
    ) {
      break;
    }
  }

  if (createError) {
    console.error("[CALLBACK]: Error creando negocio:", createError.message);
  }

  return NextResponse.redirect(`${origin}/login?confirmed=true`);
}
