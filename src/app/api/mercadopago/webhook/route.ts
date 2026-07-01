import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/core/lib/supabase/admin";
import { MercadoPagoConfig, PreApproval } from "mercadopago";
import {
  getMercadoPagoNotificationId,
  verifyMercadoPagoSignature,
} from "@/core/lib/mercadopago";

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

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const contentType = request.headers.get("content-type") ?? "";

    // Verify signature if webhook secret is configured
    if (MP_WEBHOOK_SECRET) {
      const xSignature = request.headers.get("x-signature");
      const xRequestId = request.headers.get("x-request-id");

      if (!xSignature || !xRequestId) {
        return NextResponse.json(
          { error: "Missing webhook signature headers" },
          { status: 401 },
        );
      }

      const isValid = verifyMercadoPagoSignature({
        signature: xSignature,
        requestId: xRequestId,
        secret: MP_WEBHOOK_SECRET,
      });

      if (!isValid) {
        console.error("[MP WEBHOOK] Invalid signature — possible forgery attempt");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    }

    const notificationId = getMercadoPagoNotificationId(contentType, bodyText);

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
      } else if (!topic && notificationId) {
        await handlePreApprovalNotification(notificationId);
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
