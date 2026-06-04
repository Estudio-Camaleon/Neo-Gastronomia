import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/core/lib/supabase/admin";
import Stripe from "stripe";

const stripe = process.env["STRIPE_SECRET_KEY"]
  ? new Stripe(process.env["STRIPE_SECRET_KEY"])
  : null;

const WEBHOOK_SECRET = process.env["STRIPE_WEBHOOK_SECRET"] ?? "";

export async function POST(request: Request) {
  if (!stripe || !WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 501 },
    );
  }

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") ?? "";

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabaseAdmin.from("negocios" as never) as any;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const negocioId = session.metadata?.["negocio_id"];
        if (negocioId && session.customer) {
          await db
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: (session.subscription as string) ?? null,
              subscription_status: "active",
              plan_tier: "pro",
            })
            .eq("id", negocioId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
        const { data: negocios } = await db
          .select("id")
          .eq("stripe_subscription_id", sub.id)
          .limit(1);

        const negocioId = negocios?.[0]?.id;
        if (negocioId) {
          const status = sub.status;
          const planTier =
            status === "active" || status === "trialing" ? "pro" : "free";
          await db
            .update({
              subscription_status: status,
              plan_tier: planTier,
              current_period_ends_at: sub.current_period_end
                ? new Date(sub.current_period_end * 1000).toISOString()
                : null,
            })
            .eq("id", negocioId);
        }
        break;
      }

      case "invoice.payment_failed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await db
            .update({ subscription_status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 500 },
    );
  }
}
