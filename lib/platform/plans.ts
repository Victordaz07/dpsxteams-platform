import { getServiceClient } from "@/lib/supabase/service";
import { logAction } from "./audit";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/nextauth-config";

/**
 * Plan type
 */
export type Plan = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  monthly_price_cents: number | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Plan limit type
 */
export type PlanLimit = {
  id: string;
  plan_id: string;
  key: string;
  value: number | null;
  value_text: string | null;
};

/**
 * Plan with limits
 */
export type PlanWithLimits = Plan & {
  limits: PlanLimit[];
};

/**
 * Update plan data
 */
export type UpdatePlanData = {
  name?: string;
  active?: boolean;
  monthly_price_cents?: number | null;
};

/**
 * Plan limits update (key-value pairs)
 */
export type PlanLimitsUpdate = Record<string, number | string | null>;

/**
 * Get all plans
 * Uses service role to bypass RLS
 */
export async function getAllPlans(): Promise<Plan[]> {
  const client = getServiceClient();

  const { data, error } = await client
    .schema("platform")
    .from("plans")
    .select("id, code, name, active, monthly_price_cents, stripe_product_id, stripe_price_id, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching plans:", error);
    throw new Error("Failed to fetch plans");
  }

  return data || [];
}

/**
 * Get plan by ID with limits
 * Uses service role to bypass RLS
 */
export async function getPlanById(id: string): Promise<PlanWithLimits | null> {
  const client = getServiceClient();

  // Fetch plan
  const { data: plan, error: planError } = await client
    .schema("platform")
    .from("plans")
    .select("id, code, name, active, monthly_price_cents, stripe_product_id, stripe_price_id, created_at, updated_at")
    .eq("id", id)
    .single();

  if (planError) {
    if (planError.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Error fetching plan:", planError);
    throw new Error("Failed to fetch plan");
  }

  // Fetch limits
  const { data: limits, error: limitsError } = await client
    .schema("platform")
    .from("plan_limits")
    .select("id, plan_id, key, value, value_text")
    .eq("plan_id", id)
    .order("key", { ascending: true });

  if (limitsError) {
    console.error("Error fetching plan limits:", limitsError);
    throw new Error("Failed to fetch plan limits");
  }

  return {
    ...plan,
    limits: limits || [],
  };
}

/**
 * Update plan
 * Uses service role to bypass RLS
 */
export async function updatePlan(
  id: string,
  data: UpdatePlanData
): Promise<Plan> {
  const client = getServiceClient();

  // Get old plan for audit log
  const oldPlan = await getPlanById(id);

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.active !== undefined) {
    updateData.active = data.active;
  }
  if (data.monthly_price_cents !== undefined) {
    updateData.monthly_price_cents = data.monthly_price_cents;
  }

  const { data: plan, error } = await client
    .schema("platform")
    .from("plans")
    .update(updateData)
    .eq("id", id)
    .select("id, code, name, active, monthly_price_cents, stripe_product_id, stripe_price_id, created_at, updated_at")
    .single();

  if (error) {
    console.error("Error updating plan:", error);
    throw new Error("Failed to update plan");
  }

  // Log audit action
  try {
    const session = await getServerSession(nextAuthConfig);
    const platformUserId = session?.user?.platform_user_id || null;

    if (platformUserId) {
      await logAction(
        platformUserId,
        "plan_updated",
        "plan",
        id,
        {
          before: oldPlan
            ? {
                name: oldPlan.name,
                active: oldPlan.active,
                monthly_price_cents: oldPlan.monthly_price_cents,
              }
            : null,
          after: {
            name: plan.name,
            active: plan.active,
            monthly_price_cents: plan.monthly_price_cents,
          },
        }
      );
    }
  } catch (auditError) {
    // Don't fail the update if audit logging fails
    console.error("Error logging audit action:", auditError);
  }

  return plan;
}

/**
 * Update plan limits
 * Uses service role to bypass RLS
 * Upserts limits (creates if doesn't exist, updates if exists)
 */
export async function updatePlanLimits(
  planId: string,
  limits: PlanLimitsUpdate
): Promise<PlanLimit[]> {
  const client = getServiceClient();

  // Get existing limits to know which to update vs insert
  const { data: existingLimits } = await client
    .schema("platform")
    .from("plan_limits")
    .select("id, key")
    .eq("plan_id", planId);

  const existingKeys = new Set(existingLimits?.map((l) => l.key) || []);

  // Process each limit
  const deleteOperations: Promise<void>[] = [];
  const upsertOperations: Promise<PlanLimit>[] = [];

  for (const [key, value] of Object.entries(limits)) {
    if (value === null) {
      // Delete limit if it exists
      if (existingKeys.has(key)) {
        deleteOperations.push(
          client
            .schema("platform")
            .from("plan_limits")
            .delete()
            .eq("plan_id", planId)
            .eq("key", key)
            .then(() => undefined)
        );
      }
      continue;
    }

    const limitData: {
      plan_id: string;
      key: string;
      value: number | null;
      value_text: string | null;
    } = {
      plan_id: planId,
      key,
      value: null,
      value_text: null,
    };

    // Determine if value is number or text
    if (typeof value === "number") {
      limitData.value = value;
    } else if (typeof value === "string") {
      limitData.value_text = value;
    }

    if (existingKeys.has(key)) {
      // Update existing limit
      upsertOperations.push(
        client
          .schema("platform")
          .from("plan_limits")
          .update(limitData)
          .eq("plan_id", planId)
          .eq("key", key)
          .select("id, plan_id, key, value, value_text")
          .single()
          .then(({ data, error }) => {
            if (error) throw error;
            return data;
          })
      );
    } else {
      // Insert new limit
      upsertOperations.push(
        client
          .schema("platform")
          .from("plan_limits")
          .insert(limitData)
          .select("id, plan_id, key, value, value_text")
          .single()
          .then(({ data, error }) => {
            if (error) throw error;
            return data;
          })
      );
    }
  }

  // Execute all operations
  await Promise.all([...deleteOperations, ...upsertOperations]);

  // Fetch all limits after updates
  const { data: allLimits, error } = await client
    .schema("platform")
    .from("plan_limits")
    .select("id, plan_id, key, value, value_text")
    .eq("plan_id", planId)
    .order("key", { ascending: true });

  if (error) {
    console.error("Error fetching updated limits:", error);
    throw new Error("Failed to fetch updated limits");
  }

  // Log audit action
  try {
    const session = await getServerSession(nextAuthConfig);
    const platformUserId = session?.user?.platform_user_id || null;

    if (platformUserId) {
      await logAction(
        platformUserId,
        "plan_limits_updated",
        "plan",
        planId,
        {
          before: null, // We don't store old limits for simplicity
          after: { limits: allLimits || [] },
        }
      );
    }
  } catch (auditError) {
    // Don't fail the update if audit logging fails
    console.error("Error logging audit action:", auditError);
  }

  return allLimits || [];
}

