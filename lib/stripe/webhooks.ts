import Stripe from "stripe";
import { stripe, STRIPE_WEBHOOK_SECRET } from "./config";

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
}

/**
 * Extract event type from Stripe event
 */
export function getEventType(event: Stripe.Event): string {
  return event.type;
}

/**
 * Get organization ID from Stripe metadata
 */
export function getOrganizationIdFromMetadata(
  metadata: Stripe.MetadataParam | Stripe.Metadata | null | undefined
): string | null {
  if (!metadata) return null;
  return (metadata.organization_id as string) || null;
}

