import { NextResponse } from "next/server";
import { createClient } from "@/core/lib/supabase/server";
import { supabaseAdmin } from "@/core/lib/supabase/admin";

const BUCKET = "imagenes-negocios";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_FIELDS = ["logo_url", "banner_url"] as const;

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
  return url
    .slice(index + marker.length)
    .split("?")[0]
    .split("#")[0];
}

export async function POST(request: Request) {
  try {
    const { userId, negocioId } = await getAuthenticatedTenant();
    const formData = await request.formData();
    const file = formData.get("file");
    const field = formData.get("field");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo válido." },
        { status: 400 },
      );
    }

    if (typeof field !== "string" || !ALLOWED_FIELDS.includes(field as (typeof ALLOWED_FIELDS)[number])) {
      return NextResponse.json(
        { error: "No se recibió el tipo de imagen válido." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Solo se permiten archivos de imagen." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "El archivo excede el límite permitido de 5MB." },
        { status: 400 },
      );
    }

    const filePath = `identidad/${field}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `No se pudo subir la imagen: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);

    return NextResponse.json({
      publicUrl: `${data.publicUrl}?v=${Date.now()}`,
      filePath,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  try {
    await getAuthenticatedTenant();
    const body = (await request.json().catch(() => ({}))) as { url?: string };
    const path = getStoragePathFromUrl(body.url);

    if (!path) {
      return NextResponse.json({ error: "URL inválida." }, { status: 400 });
    }

    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);

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