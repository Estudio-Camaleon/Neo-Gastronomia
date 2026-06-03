import { NextResponse } from "next/server";
import { createClient } from "@/core/lib/supabase/server";
import { supabaseAdmin } from "@/core/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { origin, searchParams } = url;
  const code = searchParams.get("code");
  const access_token = searchParams.get("access_token");
  const refresh_token = searchParams.get("refresh_token");

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (negocio) {
    return NextResponse.redirect(`${origin}/pedidos`);
  }

  const nombreNegocio =
    (user.user_metadata?.["nombre_negocio"] as string | undefined) ||
    (user.user_metadata?.["full_name"]
      ? (user.user_metadata["full_name"] as string).split(" ")[0] + "'s Local"
      : undefined) ||
    "Mi Local";

  const defaultSlug = nombreNegocio
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const { error: createError } = await supabaseAdmin
    .from("negocios")
    .insert({
      user_id: user.id,
      nombre: nombreNegocio,
      slug: defaultSlug || `local-${user.id.slice(0, 8)}`,
    });

  if (createError) {
    console.error("[CALLBACK]: Error creando negocio:", createError.message);
  }

  return NextResponse.redirect(`${origin}/onboarding`);
}
