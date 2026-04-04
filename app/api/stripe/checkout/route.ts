import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validation";
import { getPriceIdForTier, getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }
  if (actor.role !== "agency_admin") {
    return NextResponse.json({ error: "Alleen agency admins mogen Stripe checkout openen." }, { status: 403 });
  }

  const json = await request.json();
  const parsed = checkoutSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ongeldige checkout payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const priceId = getPriceIdForTier(parsed.data.packageTier);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${origin}/agency?checkout=success`,
      cancel_url: `${origin}/agency?checkout=cancelled`,
      billing_address_collection: "required",
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      metadata: {
        tenantId: parsed.data.tenantId,
        packageTier: parsed.data.packageTier
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kon Stripe checkout niet aanmaken.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
