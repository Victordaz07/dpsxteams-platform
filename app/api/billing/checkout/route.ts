import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireActiveOrg } from "@/lib/auth/guards";
import { stripe, STRIPE_DEFAULT_SUCCESS_URL, STRIPE_DEFAULT_CANCEL_URL } from "@/lib/stripe/config";
import { getPlatformClient } from "@/lib/supabase/platform";

/**
 * POST /api/billing/checkout
 * Creates a Stripe Checkout Session for a plan
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const organizationId = await requireActiveOrg();

    const body = await request.json();
    const { price_id, addons } = body;

    if (!price_id || typeof price_id !== "string") {
      return NextResponse.json(
        { error: "price_id is required" },
        { status: 400 }
      );
    }

    const platformClient = getPlatformClient();

    // Verify plan exists
    const { data: plan, error: planError } = await platformClient
      .from("plans")
      .select("id, code, stripe_price_id")
      .eq("stripe_price_id", price_id)
      .eq("active", true)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // Build line items
    const lineItems: any[] = [
      {
        price: price_id,
        quantity: 1,
      },
    ];

    // Add addons if provided
    if (addons && Array.isArray(addons)) {
      for (const addonPriceId of addons) {
        const { data: addon, error: addonError } = await platformClient
          .from("addons")
          .select("id, stripe_price_id")
          .eq("stripe_price_id", addonPriceId)
          .eq("active", true)
          .single();

        if (!addonError && addon) {
          lineItems.push({
            price: addonPriceId,
            quantity: 1,
          });
        }
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: lineItems,
      success_url: STRIPE_DEFAULT_SUCCESS_URL,
      cancel_url: STRIPE_DEFAULT_CANCEL_URL,
      metadata: {
        organization_id: organizationId,
      },
      subscription_data: {
        metadata: {
          organization_id: organizationId,
        },
      },
    });

    return NextResponse.json({
      session_id: session.id,
      url: session.url,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error; // Re-throw redirects
    }
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

