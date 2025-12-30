import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireActiveOrg } from "@/lib/auth/guards";
import { getEntitlements } from "@/lib/entitlements/check";
import { checkGracePeriod } from "@/lib/entitlements/enforce";
import { GRACE_DAYS } from "@/lib/stripe/config";

/**
 * GET /api/entitlements
 * Returns entitlements for the active organization (frontend consumption)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const organizationId = await requireActiveOrg();

    const entitlements = await getEntitlements(organizationId);

    if (!entitlements) {
      return NextResponse.json(
        { error: "No entitlements found" },
        { status: 404 }
      );
    }

    const grace = await checkGracePeriod(organizationId);

    // Build response payload
    const response = {
      plan: {
        code: entitlements.plan_code || null,
        status: entitlements.status,
      },
      limits: {
        max_drivers: entitlements.limits.max_drivers?.value || 0,
        realtime_tracking: entitlements.limits.realtime_tracking || false,
      },
      addons: {
        extra_drivers: entitlements.addons.extra_drivers || 0,
        audit_retention_days: entitlements.addons.audit_retention_365 ? 365 : 30,
        realtime_tracking: entitlements.addons.realtime_tracking || false,
      },
      grace: {
        isInGrace: grace.isInGrace,
        graceUntil: grace.graceUntil?.toISOString() || null,
        graceDays: GRACE_DAYS,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error; // Re-throw redirects
    }
    console.error("Error getting entitlements:", error);
    return NextResponse.json(
      { error: "Failed to get entitlements" },
      { status: 500 }
    );
  }
}

