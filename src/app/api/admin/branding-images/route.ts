import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/core/lib/supabase/admin";
import {
  parseStorageUrl,
  getAuthenticatedTenantWithUser,
} from "@/core/lib/tenant";
import {
  getStorageBucket,
  buildStoragePath,
} from "@/core/lib/utils/storage";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_FIELDS = ["logo_url", "banner_url"] as const;
const FIELD_TO_ENTITY = { logo_url: "logo", banner_url: "banner" } as const;

export async function POST(request: Request) {
  try {
    const { negocioId } = await getAuthenticatedTenantWithUser();
    const formData = await request.formData();
    const file = formData.get("file");
    const field = formData.get("field");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo válido." },
        { status: 400 },
      );
    }

    if (
      typeof field !== "string" ||
      !ALLOWED_FIELDS.includes(field as (typeof ALLOWED_FIELDS)[number])
    ) {
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

    const fileExt = file.name.split(".").pop() || "webp";
    const entity = FIELD_TO_ENTITY[field as keyof typeof FIELD_TO_ENTITY];
    const filename = `${entity}.${fileExt}`;
    const filePath = buildStoragePath(negocioId, entity, filename);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(getStorageBucket())
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

    const { data } = supabaseAdmin.storage
      .from(getStorageBucket())
      .getPublicUrl(filePath);

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
    await getAuthenticatedTenantWithUser();
    const body = (await request.json().catch(() => ({}))) as { url?: string };
    const parsed = parseStorageUrl(body.url);

    if (!parsed) {
      return NextResponse.json({ error: "URL inválida." }, { status: 400 });
    }

    const { error } = await supabaseAdmin.storage
      .from(parsed.bucket)
      .remove([parsed.path]);

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
