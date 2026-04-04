import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

function mapSubscriptionStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "paused":
      return "paused";
    case "unpaid":
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
      return "blocked";
    default:
      return "paused";
  }
}

export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook-configuratie ontbreekt." }, { status: 400 });
  }

  const stripe = getStripe();
  const body = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("TODO sync checkout session to tenant", {
          tenantId: session.metadata?.tenantId,
          customerId: session.customer
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("TODO sync subscription state", {
          customerId: subscription.customer,
          subscriptionId: subscription.id,
          status: mapSubscriptionStatus(subscription.status)
        });
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("TODO record invoice/payment event", {
          customerId: invoice.customer,
          status: invoice.status,
          eventType: event.type
        });
        break;
      }
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ongeldige Stripe webhook.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

