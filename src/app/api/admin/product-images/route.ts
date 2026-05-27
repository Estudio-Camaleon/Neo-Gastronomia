import { NextResponse } from "next/server";
import { createClient } from "@/core/lib/supabase/server";

const BUCKET = "media";

async function getAuthenticatedTenant() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Acceso denegado. No autenticado.");
  }

  const { data: negocio, error: tenantError } = await supabase
    .from("negocios")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (tenantError || !negocio) {
    throw new Error("Inconsistencia Multi-tenant: Local no asignado.");
  }

  return { userId: user.id, negocioId: negocio.id };
}

function getStoragePathFromUrl(url: string | null | undefined) {
  if (!url) return null;
  const marker = `/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { userId, negocioId } = await getAuthenticatedTenant();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo válido." },
        { status: 400 },
      );
    }

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${negocioId}-${userId}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `No se pudo subir la imagen: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    return NextResponse.json({ publicUrl: data.publicUrl, filePath });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    await getAuthenticatedTenant();
    const body = (await request.json().catch(() => ({}))) as { url?: string };
    const path = getStoragePathFromUrl(body.url);

    if (!path) {
      return NextResponse.json({ error: "URL inválida." }, { status: 400 });
    }

    const { error } = await supabase.storage.from(BUCKET).remove([path]);

    if (error) {
      return NextResponse.json(
        { error: `No se pudo eliminar la imagen: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}