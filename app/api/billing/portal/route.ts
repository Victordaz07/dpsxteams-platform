import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireActiveOrg } from "@/lib/auth/guards";
import { stripe, STRIPE_DEFAULT_CANCEL_URL } from "@/lib/stripe/config";
import { getPlatformClient } from "@/lib/supabase/platform";

/**
 * POST /api/billing/portal
 * Creates a Stripe Customer Portal session
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const organizationId = await requireActiveOrg();

    const platformClient = getPlatformClient();

    // Get subscription to find stripe_customer_id
    const { data: subscription, error: subError } = await platformClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("organization_id", organizationId)
      .in("status", ["active", "trialing", "past_due"])
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: STRIPE_DEFAULT_CANCEL_URL, // Or use a proper return URL
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error; // Re-throw redirects
    }
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}

