import { getPlatformClient } from "@/lib/supabase/platform";

/**
 * Rebuild entitlements cache for an organization
 * This is the source of truth reconstruction from subscriptions + addons
 */
export async function rebuildEntitlements(organizationId: string) {
  const platformClient = getPlatformClient();

  // Get active subscription
  const { data: subscription, error: subError } = await platformClient
    .from("subscriptions")
    .select(`
      *,
      plans:plan_id (
        code,
        plan_limits:plan_limits (*)
      )
    `)
    .eq("organization_id", organizationId)
    .in("status", ["active", "trialing", "past_due"])
    .single();

  if (subError || !subscription) {
    // No active subscription - clear entitlements or set defaults
    await platformClient
      .from("entitlements")
      .upsert({
        organization_id: organizationId,
        plan_code: null,
        status: "inactive",
        limits: {},
        addons: {},
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "organization_id"
      });
    return;
  }

  const plan = subscription.plans as any;
  const planLimits = plan?.plan_limits || [];

  // Build limits object from plan limits
  const limits: Record<string, any> = {};
  planLimits.forEach((limit: any) => {
    limits[limit.limit_key] = limit.limit_value;
  });

  // Get active addons for this organization
  const { data: orgAddons, error: addonsError } = await platformClient
    .from("org_addons")
    .select(`
      quantity,
      addons:addon_id (
        code
      )
    `)
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (!addonsError && orgAddons) {
    const addons: Record<string, any> = {};
    orgAddons.forEach((orgAddon: any) => {
      const addon = orgAddon.addons as any;
      if (addon?.code) {
        if (addon.code === "extra_drivers") {
          // For quantity-based addons, store quantity
          addons[addon.code] = orgAddon.quantity || 1;
          // Add to max_drivers limit
          const currentMaxDrivers = limits.max_drivers?.value || 0;
          limits.max_drivers = {
            value: currentMaxDrivers + (orgAddon.quantity || 0),
          };
        } else if (addon.code === "realtime_tracking") {
          addons[addon.code] = true;
          limits.realtime_tracking = true;
        } else if (addon.code === "audit_retention_365") {
          addons[addon.code] = true;
          limits.audit_retention_days = 365;
        } else {
          addons[addon.code] = true;
        }
      }
    });

    // Determine status based on subscription status and grace period
    let status = subscription.status;
    if (subscription.status === "past_due") {
      if (subscription.grace_period_until) {
        const graceUntil = new Date(subscription.grace_period_until);
        if (graceUntil > new Date()) {
          status = "grace_period";
        }
      }
    }

    // Upsert entitlements
    await platformClient
      .from("entitlements")
      .upsert({
        organization_id: organizationId,
        plan_code: plan?.code || null,
        status,
        limits,
        addons,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "organization_id"
      });
  }
}

