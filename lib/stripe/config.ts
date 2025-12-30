import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Stripe client instance (server-only)
 * Never use this in client-side code
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

/**
 * Stripe webhook secret for verifying webhook signatures
 */
export const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;

/**
 * Default URLs for checkout sessions
 */
export const STRIPE_DEFAULT_SUCCESS_URL = env.STRIPE_DEFAULT_SUCCESS_URL;
export const STRIPE_DEFAULT_CANCEL_URL = env.STRIPE_DEFAULT_CANCEL_URL;

/**
 * Constants for plans and limits
 */
export const PLAN_LIMITS = {
  STARTER: { max_drivers: 25 },
  GROWTH: { max_drivers: 75 },
  PRO: { max_drivers: 200 },
} as const;

export const GRACE_DAYS = 7;

