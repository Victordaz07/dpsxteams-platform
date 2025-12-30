import { getServiceClient } from "@/lib/supabase/service";

/**
 * Subscription type
 */
export type Subscription = {
  id: string;
  organization_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: "active" | "trialing" | "canceled" | "past_due" | "incomplete";
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  grace_period_until: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Subscription with joined organization and plan data
 */
export type SubscriptionWithDetails = Subscription & {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  plan: {
    id: string;
    code: string;
    name: string;
  };
};

/**
 * Subscription filters
 */
export type SubscriptionFilters = {
  status?: "active" | "trialing" | "canceled" | "past_due" | "incomplete";
  organization_id?: string;
  plan_id?: string;
  q?: string; // Search query
};

/**
 * Pagination options
 */
export type PaginationOptions = {
  limit?: number;
  offset?: number;
};

/**
 * Get all subscriptions with details
 * Uses batch fetch (NO cross-schema JOINs)
 */
export async function getAllSubscriptions(
  filters?: SubscriptionFilters,
  pagination?: PaginationOptions
): Promise<SubscriptionWithDetails[]> {
  const client = getServiceClient();

  const limit = pagination?.limit ?? 50;
  const offset = pagination?.offset ?? 0;

  // Query 1: Fetch subscriptions from platform.subscriptions
  let query = client
    .schema("platform")
    .from("subscriptions")
    .select("id, organization_id, plan_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, cancel_at_period_end, grace_period_until, created_at, updated_at");

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.organization_id) {
    query = query.eq("organization_id", filters.organization_id);
  }
  if (filters?.plan_id) {
    query = query.eq("plan_id", filters.plan_id);
  }

  // Apply search query (will filter after fetching if needed)
  // Note: Search is applied after batch fetch for org names

  // Apply pagination
  query = query.range(offset, offset + limit - 1);
  query = query.order("created_at", { ascending: false });

  const { data: subscriptions, error: subscriptionsError } = await query;

  if (subscriptionsError) {
    console.error("Error fetching subscriptions:", subscriptionsError);
    throw new Error("Failed to fetch subscriptions");
  }

  if (!subscriptions || subscriptions.length === 0) {
    return [];
  }

  // Extract unique IDs for batch fetch
  const organizationIds = [...new Set(subscriptions.map((s) => s.organization_id))];
  const planIds = [...new Set(subscriptions.map((s) => s.plan_id))];

  // Query 2: Batch fetch organizations (skip if empty to avoid IN([]))
  let organizations: Array<{ id: string; name: string; slug: string }> = [];
  if (organizationIds.length > 0) {
    const { data: orgs, error: orgsError } = await client
      .schema("app")
      .from("organizations")
      .select("id, name, slug")
      .in("id", organizationIds);

    if (orgsError) {
      console.error("Error fetching organizations:", orgsError);
      throw new Error("Failed to fetch organizations");
    }

    organizations = orgs || [];
  }

  // Query 3: Batch fetch plans (skip if empty to avoid IN([]))
  let plans: Array<{ id: string; code: string; name: string }> = [];
  if (planIds.length > 0) {
    const { data: plansData, error: plansError } = await client
      .schema("platform")
      .from("plans")
      .select("id, code, name")
      .in("id", planIds);

    if (plansError) {
      console.error("Error fetching plans:", plansError);
      throw new Error("Failed to fetch plans");
    }

    plans = plansData || [];
  }

  // Create maps for O(1) lookup
  const orgMap = new Map(organizations.map((org) => [org.id, org]));
  const planMap = new Map(plans.map((plan) => [plan.id, plan]));

  // Merge subscriptions with org and plan data
  const subscriptionsWithDetails: SubscriptionWithDetails[] = subscriptions
    .map((sub) => {
      const org = orgMap.get(sub.organization_id);
      const plan = planMap.get(sub.plan_id);

      // Apply search filter: if q is provided, check org name, stripe IDs
      if (filters?.q) {
        const searchLower = filters.q.toLowerCase();
        const matchesOrgName = org?.name.toLowerCase().includes(searchLower);
        const matchesSubscriptionId = sub.stripe_subscription_id
          .toLowerCase()
          .includes(searchLower);
        const matchesCustomerId = sub.stripe_customer_id
          .toLowerCase()
          .includes(searchLower);

        if (!matchesOrgName && !matchesSubscriptionId && !matchesCustomerId) {
          return null; // Filter out this subscription
        }
      }

      if (!org || !plan) {
        // Missing org or plan data - skip this subscription
        return null;
      }

      return {
        ...sub,
        organization: org,
        plan: plan,
      };
    })
    .filter((sub): sub is SubscriptionWithDetails => sub !== null);

  return subscriptionsWithDetails;
}

/**
 * Get subscription by ID with details
 */
export async function getSubscriptionById(
  id: string
): Promise<SubscriptionWithDetails | null> {
  const client = getServiceClient();

  // Fetch subscription
  const { data: subscription, error: subError } = await client
    .schema("platform")
    .from("subscriptions")
    .select("id, organization_id, plan_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, cancel_at_period_end, grace_period_until, created_at, updated_at")
    .eq("id", id)
    .single();

  if (subError) {
    if (subError.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching subscription:", subError);
    throw new Error("Failed to fetch subscription");
  }

  if (!subscription) {
    return null;
  }

  // Batch fetch org and plan
  const [orgResult, planResult] = await Promise.all([
    client
      .schema("app")
      .from("organizations")
      .select("id, name, slug")
      .eq("id", subscription.organization_id)
      .single(),
    client
      .schema("platform")
      .from("plans")
      .select("id, code, name")
      .eq("id", subscription.plan_id)
      .single(),
  ]);

  if (orgResult.error || planResult.error) {
    console.error("Error fetching subscription details:", orgResult.error || planResult.error);
    throw new Error("Failed to fetch subscription details");
  }

  return {
    ...subscription,
    organization: orgResult.data!,
    plan: planResult.data!,
  };
}

