import { getEntitlements, getLimit, hasEntitlement } from "./check";
import { getPlatformClient } from "@/lib/supabase/platform";
import { GRACE_DAYS } from "@/lib/stripe/config";

export interface GracePeriodInfo {
  isInGrace: boolean;
  graceUntil: Date | null;
  daysRemaining: number;
}

/**
 * Check grace period status for an organization
 */
export async function checkGracePeriod(
  organizationId: string
): Promise<GracePeriodInfo> {
  const platformClient = getPlatformClient();

  const { data: subscription, error } = await platformClient
    .from("subscriptions")
    .select("status, grace_period_until")
    .eq("organization_id", organizationId)
    .in("status", ["active", "trialing", "past_due"])
    .single();

  if (error || !subscription || subscription.status !== "past_due") {
    return {
      isInGrace: false,
      graceUntil: null,
      daysRemaining: 0,
    };
  }

  if (!subscription.grace_period_until) {
    // Shouldn't happen, but if it does, grace is not active
    return {
      isInGrace: false,
      graceUntil: null,
      daysRemaining: 0,
    };
  }

  const graceUntil = new Date(subscription.grace_period_until);
  const now = new Date();
  const isInGrace = graceUntil > now;

  const daysRemaining = isInGrace
    ? Math.ceil((graceUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    isInGrace,
    graceUntil,
    daysRemaining,
  };
}

/**
 * Check if organization can create a driver (enforce max_drivers limit)
 */
export async function canCreateDriver(organizationId: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  maxDrivers?: number;
}> {
  const entitlements = await getEntitlements(organizationId);
  if (!entitlements) {
    return { allowed: false, reason: "No entitlements found" };
  }

  // Check status - critical writes blocked if grace expired or inactive
  if (entitlements.status === "inactive" || entitlements.status === "canceled") {
    return { allowed: false, reason: "Subscription inactive" };
  }

  if (entitlements.status === "past_due") {
    const grace = await checkGracePeriod(organizationId);
    if (!grace.isInGrace) {
      return {
        allowed: false,
        reason: "Grace period expired. Please update payment method.",
      };
    }
  }

  // Get max_drivers limit
  const maxDrivers = await getLimit(organizationId, "max_drivers");
  if (typeof maxDrivers !== "number") {
    return { allowed: false, reason: "Invalid max_drivers limit" };
  }

  // TODO: Count actual drivers in app.drivers table (when EPIC 6 is implemented)
  // For now, we'll assume no drivers exist yet
  const currentCount = 0;

  if (currentCount >= maxDrivers) {
    return {
      allowed: false,
      reason: `Maximum drivers limit reached (${maxDrivers})`,
      currentCount,
      maxDrivers,
    };
  }

  return { allowed: true, currentCount, maxDrivers };
}

/**
 * Check if organization can enable realtime tracking
 */
export async function canEnableTracking(organizationId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const entitlements = await getEntitlements(organizationId);
  if (!entitlements) {
    return { allowed: false, reason: "No entitlements found" };
  }

  // Check status - critical writes blocked if grace expired or inactive
  if (entitlements.status === "inactive" || entitlements.status === "canceled") {
    return { allowed: false, reason: "Subscription inactive" };
  }

  if (entitlements.status === "past_due") {
    const grace = await checkGracePeriod(organizationId);
    if (!grace.isInGrace) {
      return {
        allowed: false,
        reason: "Grace period expired. Please update payment method.",
      };
    }
  }

  // Check for realtime_tracking entitlement
  const hasTracking = await hasEntitlement(organizationId, "realtime_tracking");
  if (!hasTracking) {
    return {
      allowed: false,
      reason: "Realtime tracking addon required. Please upgrade your plan.",
    };
  }

  return { allowed: true };
}

/**
 * Get audit retention days allowed for organization
 */
export async function canUseAuditRetention(
  organizationId: string
): Promise<number> {
  const entitlements = await getEntitlements(organizationId);
  if (!entitlements) {
    return 30; // Default
  }

  // Check for audit_retention_365 addon
  const has365 = await hasEntitlement(organizationId, "audit_retention_365");
  if (has365) {
    return 365;
  }

  // Default retention
  return 30;
}

/**
 * Check subscription status (for non-critical writes that allow grace)
 */
export async function checkStatus(organizationId: string): Promise<{
  status: string;
  isActive: boolean;
  isInGrace: boolean;
  warning?: string;
}> {
  const entitlements = await getEntitlements(organizationId);
  if (!entitlements) {
    return {
      status: "inactive",
      isActive: false,
      isInGrace: false,
    };
  }

  const isActive = entitlements.status === "active" || entitlements.status === "trialing";
  const isInGrace =
    entitlements.status === "grace_period" ||
    (entitlements.status === "past_due" && (await checkGracePeriod(organizationId)).isInGrace);

  let warning: string | undefined;
  if (entitlements.status === "past_due" && isInGrace) {
    const grace = await checkGracePeriod(organizationId);
    warning = `Payment past due. Grace period expires in ${grace.daysRemaining} days.`;
  }

  return {
    status: entitlements.status,
    isActive,
    isInGrace,
    warning,
  };
}

