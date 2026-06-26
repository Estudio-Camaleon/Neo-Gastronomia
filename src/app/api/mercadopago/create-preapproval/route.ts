import { NextResponse } from "next/server";
import { createClient } from "@/core/lib/supabase/server";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

const MP_ACCESS_TOKEN = process.env["MERCADO_PAGO_ACCESS_TOKEN"];
const TEST_PAYER_EMAIL = process.env["MERCADO_PAGO_TEST_PAYER_EMAIL"];

function getMPClient() {
  if (!MP_ACCESS_TOKEN) return null;
  return new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
}

export async function POST(req: Request) {
  const client = getMPClient();
  if (!client) {
    return NextResponse.json(
      { error: "Mercado Pago no configurado" },
      { status: 501 },
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase.from("negocios" as never) as any;
    const { data: negocios } = await db
      .select("id, mp_customer_id")
      .eq("user_id", user.id)
      .limit(1);

    const negocio = negocios?.[0];
    if (!negocio) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
        { status: 404 },
      );
    }

    const originUrl = req.headers.get("origin");
    const siteUrl = process.env["NEXT_PUBLIC_SITE_URL"] ?? originUrl ?? "";

    const backUrl = siteUrl ? `${siteUrl}/configuracion` : undefined;

    console.log("[MP PREAPPROVAL] Debug:", {
      NEXT_PUBLIC_SITE_URL: process.env["NEXT_PUBLIC_SITE_URL"],
      origin: originUrl,
      siteUrl,
      backUrl,
    });

    const preApproval = new PreApproval(client);

    const result = await preApproval.create({
      body: {
        reason: "NEO PRO - Plan Mensual",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 15,
          currency_id: "ARS",
        },
        payer_email: TEST_PAYER_EMAIL ?? user.email ?? undefined,
        back_url: backUrl,
        external_reference: negocio.id,
      },
    });

    if (!result.id) {
      throw new Error("No se obtuvo ID de preaprobación");
    }

    // Guardar referencia inicial
    await db
      .update({
        mp_subscription_id: result.id,
        mp_status: "pending",
        subscription_status: "pending",
      })
      .eq("id", negocio.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initPoint = (result as any).init_point;
    console.log("[MP PREAPPROVAL] created id=%s back_url=%s", result.id, backUrl);
    return NextResponse.json({ url: initPoint });
  } catch (error: unknown) {
    console.error("[MP CREATE PREAPPROVAL]", error);
    const detail = error instanceof Object && "message" in error
      ? (error as { message: string }).message
      : "Error interno";
    return NextResponse.json(
      { error: detail },
      { status: 500 },
    );
  }
}
