import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, getEventType, getOrganizationIdFromMetadata } from "@/lib/stripe/webhooks";
import { stripe } from "@/lib/stripe/config";
import { getPlatformClient } from "@/lib/supabase/platform";
import { rebuildEntitlements } from "@/lib/entitlements/rebuild";
import { GRACE_DAYS } from "@/lib/stripe/config";

/**
 * Stripe webhook endpoint
 * Handles idempotency and processes billing events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = verifyWebhookSignature(body, signature);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const platformClient = getPlatformClient();
  const eventType = getEventType(event);

  // Idempotency check: Insert event.id FIRST (if exists, return 200)
  const { data: existingEvent, error: existingError } = await platformClient
    .from("stripe_events")
    .select("id, processed_at")
    .eq("id", event.id)
    .single();

  if (existingEvent && existingEvent.processed_at) {
    // Already processed
    return NextResponse.json({ received: true });
  }

  // Insert event record (for idempotency tracking)
  await platformClient
    .from("stripe_events")
    .upsert({
      id: event.id,
      type: eventType,
      payload: event as any,
      created_at: new Date().toISOString(),
    }, {
      onConflict: "id"
    });

  try {
    // Process event based on type
    await processStripeEvent(event, platformClient);

    // Mark as processed
    await platformClient
      .from("stripe_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${event.id}:`, error);
    // Don't mark as processed - allows retry
    return NextResponse.json(
      { error: "Processing failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function processStripeEvent(event: any, platformClient: any) {
  const eventType = event.type;

  switch (eventType) {
    case "checkout.session.completed": {
      await handleCheckoutSessionCompleted(event.data.object, platformClient);
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      await handleSubscriptionUpdated(event.data.object, platformClient);
      break;
    }
    case "customer.subscription.deleted": {
      await handleSubscriptionDeleted(event.data.object, platformClient);
      break;
    }
    case "invoice.payment_succeeded": {
      await handleInvoicePaymentSucceeded(event.data.object, platformClient);
      break;
    }
    case "invoice.payment_failed": {
      await handleInvoicePaymentFailed(event.data.object, platformClient);
      break;
    }
    default:
      // Unhandled event type - log but don't fail
      console.log(`Unhandled event type: ${eventType}`);
  }
}

async function handleCheckoutSessionCompleted(session: any, platformClient: any) {
  const organizationId = getOrganizationIdFromMetadata(session.metadata);
  if (!organizationId) {
    throw new Error("Missing organization_id in checkout session metadata");
  }

  // Get subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  // Get plan by stripe_price_id
  const { data: plan, error: planError } = await platformClient
    .from("plans")
    .select("id")
    .eq("stripe_price_id", subscription.items.data[0].price.id)
    .single();

  if (planError || !plan) {
    throw new Error(`Plan not found for price_id: ${subscription.items.data[0].price.id}`);
  }

  // Upsert subscription
  await platformClient
    .from("subscriptions")
    .upsert({
      organization_id: organizationId,
      plan_id: plan.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      grace_period_until: null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "stripe_subscription_id"
    });

  // Rebuild entitlements
  await rebuildEntitlements(organizationId);
}

async function handleSubscriptionUpdated(subscription: any, platformClient: any) {
  // Get plan by stripe_price_id
  const { data: plan, error: planError } = await platformClient
    .from("plans")
    .select("id")
    .eq("stripe_price_id", subscription.items.data[0].price.id)
    .single();

  if (planError || !plan) {
    throw new Error(`Plan not found for price_id: ${subscription.items.data[0].price.id}`);
  }

  // Get existing subscription to get organization_id
  const { data: existingSub, error: existingError } = await platformClient
    .from("subscriptions")
    .select("organization_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (existingError || !existingSub) {
    throw new Error(`Subscription not found: ${subscription.id}`);
  }

  const organizationId = existingSub.organization_id;

  // Update subscription
  await platformClient
    .from("subscriptions")
    .update({
      plan_id: plan.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  // Rebuild entitlements
  await rebuildEntitlements(organizationId);
}

async function handleSubscriptionDeleted(subscription: any, platformClient: any) {
  // Get existing subscription to get organization_id
  const { data: existingSub, error: existingError } = await platformClient
    .from("subscriptions")
    .select("organization_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (existingError || !existingSub) {
    // Already deleted or doesn't exist
    return;
  }

  const organizationId = existingSub.organization_id;

  // Update subscription status
  await platformClient
    .from("subscriptions")
    .update({
      status: "canceled",
      grace_period_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  // Rebuild entitlements
  await rebuildEntitlements(organizationId);
}

async function handleInvoicePaymentSucceeded(invoice: any, platformClient: any) {
  if (!invoice.subscription) {
    return; // One-time payment, not subscription
  }

  // Get existing subscription
  const { data: subscription, error: subError } = await platformClient
    .from("subscriptions")
    .select("organization_id")
    .eq("stripe_subscription_id", invoice.subscription)
    .single();

  if (subError || !subscription) {
    return;
  }

  const organizationId = subscription.organization_id;

  // Update subscription to active and clear grace period
  await platformClient
    .from("subscriptions")
    .update({
      status: "active",
      grace_period_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", invoice.subscription);

  // Rebuild entitlements
  await rebuildEntitlements(organizationId);
}

async function handleInvoicePaymentFailed(invoice: any, platformClient: any) {
  if (!invoice.subscription) {
    return; // One-time payment, not subscription
  }

  // Get existing subscription
  const { data: subscription, error: subError } = await platformClient
    .from("subscriptions")
    .select("organization_id")
    .eq("stripe_subscription_id", invoice.subscription)
    .single();

  if (subError || !subscription) {
    return;
  }

  const organizationId = subscription.organization_id;

  // Calculate grace period until date
  const graceUntil = new Date();
  graceUntil.setDate(graceUntil.getDate() + GRACE_DAYS);

  // Update subscription to past_due and set grace period
  await platformClient
    .from("subscriptions")
    .update({
      status: "past_due",
      grace_period_until: graceUntil.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", invoice.subscription);

  // Rebuild entitlements
  await rebuildEntitlements(organizationId);
}

