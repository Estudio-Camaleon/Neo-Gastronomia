import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/core/lib/supabase/admin";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

const MP_ACCESS_TOKEN = process.env["MERCADO_PAGO_ACCESS_TOKEN"];
const MP_WEBHOOK_SECRET = process.env["MERCADO_PAGO_WEBHOOK_SECRET"];

function getMPClient() {
  if (!MP_ACCESS_TOKEN) return null;
  return new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
}

async function handlePreApprovalNotification(preapprovalId: string): Promise<void> {
  const client = getMPClient();
  if (!client) return;

  const preApproval = new PreApproval(client);
  const sub = await preApproval.get({ id: preapprovalId });

  const mpStatus = sub.status ?? "unknown";
  const planTier = mpStatus === "authorized" ? "pro" : "free";
  const subscriptionStatus =
    mpStatus === "authorized"
      ? "active"
      : mpStatus === "cancelled"
        ? "canceled"
        : mpStatus;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabaseAdmin.from("negocios" as never) as any;
  await db
    .update({
      mp_subscription_id: preapprovalId,
      mp_status: mpStatus,
      subscription_status: subscriptionStatus,
      plan_tier: planTier,
      mp_customer_id: sub.payer_id?.toString() ?? null,
      current_period_ends_at:
        mpStatus === "authorized"
          ? new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString()
          : null,
    })
    .eq("mp_subscription_id", preapprovalId);
}

function verifySignature(
  body: string,
  xSignature: string | null,
  xRequestId: string | null,
  secret: string,
): boolean {
  if (!xSignature || !secret) return false;

  const parts = xSignature.split(",").reduce<Record<string, string>>((acc, part) => {
    const eqIdx = part.indexOf("=");
    if (eqIdx > 0) {
      const key = part.slice(0, eqIdx).trim();
      const val = part.slice(eqIdx + 1).trim();
      if (key && val) acc[key] = val;
    }
    return acc;
  }, {});

  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const { createHmac } = require("crypto");
  const data = `id:${xRequestId ?? ""};request-id:${xRequestId ?? ""};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(data).digest("hex");

  return v1 === expected;
}

function getNotificationId(contentType: string, body: string): string | null {
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(body);
    return params.get("id");
  }
  try {
    const json = JSON.parse(body);
    return json?.data?.id ?? json?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const contentType = request.headers.get("content-type") ?? "";

    // Verify signature if webhook secret is configured
    if (MP_WEBHOOK_SECRET) {
      const xSignature = request.headers.get("x-signature");
      const xRequestId = request.headers.get("x-request-id");
      const notificationId = getNotificationId(contentType, bodyText);

      const isValid = verifySignature(
        bodyText,
        xSignature,
        xRequestId ?? notificationId,
        MP_WEBHOOK_SECRET,
      );

      if (!isValid) {
        console.error("[MP WEBHOOK] Invalid signature — possible forgery attempt");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = new URLSearchParams(bodyText);
      const topic = formData.get("topic") as string | null;
      const id = formData.get("id") as string | null;

      if (topic === "subscription_preapproval" && id) {
        await handlePreApprovalNotification(id);
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = JSON.parse(bodyText);
      const topic = body?.type as string | undefined;
      const dataId = body?.data?.id as string | undefined;

      if (
        topic === "subscription_preapproval" &&
        dataId
      ) {
        await handlePreApprovalNotification(dataId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[MP WEBHOOK]", error);
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 500 },
    );
  }
}
