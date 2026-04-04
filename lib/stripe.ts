import Stripe from "stripe";
import type { PackageTier } from "@/lib/types";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: "2025-08-27.basil"
  });

  return stripeClient;
}

export function getPriceIdForTier(tier: PackageTier) {
  const map = {
    starter: process.env.STRIPE_STARTER_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
    plus: process.env.STRIPE_PLUS_PRICE_ID
  } as const;

  const priceId = map[tier];

  if (!priceId) {
    throw new Error(`Missing Stripe price id for tier: ${tier}`);
  }

  return priceId;
}
