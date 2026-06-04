import { NextResponse } from "next/server";
import { createClient } from "@/core/lib/supabase/server";
import Stripe from "stripe";

const stripe = process.env["STRIPE_SECRET_KEY"]
  ? new Stripe(process.env["STRIPE_SECRET_KEY"])
  : null;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
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
      .select("id, stripe_customer_id")
      .eq("user_id", user.id)
      .limit(1);

    const negocio = negocios?.[0];
    if (!negocio) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
        { status: 404 },
      );
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";
    const priceId = process.env["STRIPE_PRO_PRICE_ID"];

    if (!priceId) {
      return NextResponse.json(
        { error: "Producto no configurado" },
        { status: 501 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: negocio.stripe_customer_id ?? undefined,
      customer_email: negocio.stripe_customer_id ? undefined : user.email,
      metadata: { negocio_id: negocio.id },
      success_url: `${origin}/configuracion?upgrade=success`,
      cancel_url: `${origin}/configuracion?upgrade=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[STRIPE CHECKOUT]", error);
    return NextResponse.json(
      { error: "Error al crear sesión de pago" },
      { status: 500 },
    );
  }
}
