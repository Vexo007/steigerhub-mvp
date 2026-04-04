import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const actor = await getCurrentAppUser();
    if (!actor) {
      return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
    }
    if (actor.role !== "agency_admin") {
      return NextResponse.json({ error: "Alleen agency admins mogen de Stripe portal openen." }, { status: 403 });
    }

    const { stripeCustomerId } = (await request.json()) as { stripeCustomerId?: string };

    if (!stripeCustomerId) {
      return NextResponse.json({ error: "stripeCustomerId ontbreekt." }, { status: 400 });
    }

    const stripe = getStripe();
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/agency`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kon Stripe portal niet openen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
