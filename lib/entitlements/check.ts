import { getPlatformClient } from "@/lib/supabase/platform";
import { rebuildEntitlements } from "./rebuild";

export interface Entitlements {
  plan_code: string | null;
  status: "active" | "trialing" | "past_due" | "grace_period" | "inactive";
  limits: Record<string, any>;
  addons: Record<string, any>;
}

/**
 * Get entitlements for an organization (from cache, rebuilds if missing)
 */
export async function getEntitlements(organizationId: string): Promise<Entitlements | null> {
  const platformClient = getPlatformClient();

  const { data, error } = await platformClient
    .from("entitlements")
    .select("*")
    .eq("organization_id", organizationId)
    .single();

  if (error || !data) {
    // Cache miss - rebuild
    await rebuildEntitlements(organizationId);
    // Try again
    const { data: rebuiltData, error: rebuiltError } = await platformClient
      .from("entitlements")
      .select("*")
      .eq("organization_id", organizationId)
      .single();

    if (rebuiltError || !rebuiltData) {
      return null;
    }

    return {
      plan_code: rebuiltData.plan_code,
      status: rebuiltData.status,
      limits: rebuiltData.limits,
      addons: rebuiltData.addons,
    };
  }

  return {
    plan_code: data.plan_code,
    status: data.status,
    limits: data.limits,
    addons: data.addons,
  };
}

/**
 * Check if organization has a specific entitlement/feature
 */
export async function hasEntitlement(
  organizationId: string,
  featureKey: string
): Promise<boolean> {
  const entitlements = await getEntitlements(organizationId);
  if (!entitlements) return false;

  // Check in addons
  if (entitlements.addons[featureKey]) {
    return true;
  }

  // Check in limits (for features like realtime_tracking)
  if (entitlements.limits[featureKey] === true) {
    return true;
  }

  return false;
}

/**
 * Get a specific limit value
 */
export async function getLimit(
  organizationId: string,
  limitKey: string
): Promise<number | boolean | Record<string, any> | null> {
  const entitlements = await getEntitlements(organizationId);
  if (!entitlements) return null;

  const limit = entitlements.limits[limitKey];
  if (limit === undefined) return null;

  // If it's an object with value property, return the value
  if (limit && typeof limit === "object" && "value" in limit) {
    return limit.value;
  }

  return limit;
}

