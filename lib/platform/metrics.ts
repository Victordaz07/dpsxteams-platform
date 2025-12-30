import { getServiceClient } from "@/lib/supabase/service";

/**
 * Metrics type
 */
export type Metrics = {
  mrr: number; // Monthly Recurring Revenue in dollars
  activeTenants: number;
  churnRate: number; // Percentage (0-100)
  totalSubscriptions: number;
  trialingSubscriptions: number;
  pastDueSubscriptions: number;
  canceledSubscriptions: number;
};

/**
 * Churn period
 */
export type ChurnPeriod = {
  start: Date;
  end: Date;
};

/**
 * Calculate MRR (Monthly Recurring Revenue)
 * Sum of plan.monthly_price_cents for active/trialing subscriptions
 * Returns dollars (cents / 100)
 * 
 * Future-proof: When quantity field exists, multiply: plan.monthly_price_cents * quantity
 * Future-proof: When addons exist with addon_amount_cents, add to MRR
 */
export async function getMRR(): Promise<number> {
  const client = getServiceClient();

  // Fetch active/trialing subscriptions with their plans
  const { data: subscriptions, error: subError } = await client
    .schema("platform")
    .from("subscriptions")
    .select("plan_id, status")
    .in("status", ["active", "trialing"]);

  if (subError) {
    console.error("Error fetching subscriptions for MRR:", subError);
    throw new Error("Failed to calculate MRR");
  }

  if (!subscriptions || subscriptions.length === 0) {
    return 0;
  }

  // Get unique plan IDs
  const planIds = [...new Set(subscriptions.map((s) => s.plan_id))];

  // Safety check: skip if empty to avoid IN([])
  if (planIds.length === 0) {
    return 0;
  }

  // Fetch plans with monthly_price_cents
  const { data: plans, error: plansError } = await client
    .schema("platform")
    .from("plans")
    .select("id, monthly_price_cents")
    .in("id", planIds);

  if (plansError) {
    console.error("Error fetching plans for MRR:", plansError);
    throw new Error("Failed to calculate MRR");
  }

  // Create plan map
  const planMap = new Map(
    (plans || []).map((plan) => [plan.id, plan.monthly_price_cents])
  );

  // Calculate MRR: sum of monthly_price_cents (treat null as 0)
  // Today: simple sum (no quantity/addons yet)
  // Future: sum((plan.monthly_price_cents * quantity) + addon_amount_cents)
  let totalCents = 0;
  for (const sub of subscriptions) {
    const priceCents = planMap.get(sub.plan_id);
    if (priceCents !== null && priceCents !== undefined) {
      totalCents += priceCents;
      // Future: if quantity exists, multiply here
      // Future: if addons exist, add addon_amount_cents here
    }
  }

  // Convert cents to dollars
  return totalCents / 100;
}

/**
 * Get active tenants count
 * Organizations with active/trialing subscriptions
 */
export async function getActiveTenantsCount(): Promise<number> {
  const client = getServiceClient();

  // Get distinct organization IDs with active/trialing subscriptions
  const { data: orgIds, error: orgError } = await client
    .schema("platform")
    .from("subscriptions")
    .select("organization_id")
    .in("status", ["active", "trialing"]);

  if (orgError) {
    console.error("Error fetching active tenant IDs:", orgError);
    throw new Error("Failed to count active tenants");
  }

  if (!orgIds || orgIds.length === 0) {
    return 0;
  }

  const uniqueOrgIds = new Set(orgIds.map((s) => s.organization_id));
  return uniqueOrgIds.size;
}

/**
 * Calculate churn rate for a period
 * Formula: (canceled subscriptions in period / total active at start) * 100
 */
export async function getChurnRate(period: ChurnPeriod): Promise<number> {
  const client = getServiceClient();

  // Get total active subscriptions at start of period
  const { data: activeAtStart, error: startError } = await client
    .schema("platform")
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .in("status", ["active", "trialing"])
    .lte("created_at", period.start.toISOString());

  if (startError) {
    console.error("Error counting active subscriptions at start:", startError);
    throw new Error("Failed to calculate churn rate");
  }

  const totalAtStart = activeAtStart?.length || 0;

  if (totalAtStart === 0) {
    return 0; // No churn if no subscriptions at start
  }

  // Get canceled subscriptions in period
  const { data: canceled, error: canceledError } = await client
    .schema("platform")
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("status", "canceled")
    .gte("updated_at", period.start.toISOString())
    .lte("updated_at", period.end.toISOString());

  if (canceledError) {
    console.error("Error counting canceled subscriptions:", canceledError);
    throw new Error("Failed to calculate churn rate");
  }

  const canceledCount = canceled?.length || 0;

  // Calculate churn rate percentage
  return (canceledCount / totalAtStart) * 100;
}

/**
 * Get all metrics aggregated
 */
export async function getMetrics(): Promise<Metrics> {
  const client = getServiceClient();

  // Fetch all subscriptions for counts
  const { data: allSubscriptions, error: subError } = await client
    .schema("platform")
    .from("subscriptions")
    .select("status");

  if (subError) {
    console.error("Error fetching subscriptions for metrics:", subError);
    throw new Error("Failed to fetch metrics");
  }

  const subscriptions = allSubscriptions || [];

  // Count by status
  const totalSubscriptions = subscriptions.length;
  const trialingSubscriptions = subscriptions.filter(
    (s) => s.status === "trialing"
  ).length;
  const pastDueSubscriptions = subscriptions.filter(
    (s) => s.status === "past_due"
  ).length;
  const canceledSubscriptions = subscriptions.filter(
    (s) => s.status === "canceled"
  ).length;

  // Calculate MRR and active tenants
  const [mrr, activeTenants] = await Promise.all([
    getMRR(),
    getActiveTenantsCount(),
  ]);

  // Calculate churn rate for last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const churnRate = await getChurnRate({
    start: thirtyDaysAgo,
    end: now,
  });

  return {
    mrr,
    activeTenants,
    churnRate,
    totalSubscriptions,
    trialingSubscriptions,
    pastDueSubscriptions,
    canceledSubscriptions,
  };
}

