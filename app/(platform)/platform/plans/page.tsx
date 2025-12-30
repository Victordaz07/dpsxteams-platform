import { requirePlatformRole } from "@/lib/auth/guards";
import { getAllPlans, getPlanById, updatePlan, updatePlanLimits } from "@/lib/platform/plans";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

async function updatePlanAction(formData: FormData) {
  "use server";
  
  await requirePlatformRole();
  
  const planId = formData.get("planId") as string;
  const name = formData.get("name") as string;
  const active = formData.get("active") === "true";
  const monthlyPriceCentsStr = formData.get("monthly_price_cents") as string;

  if (!planId || !name) {
    throw new Error("Missing required fields");
  }

  const monthlyPriceCents = monthlyPriceCentsStr 
    ? (monthlyPriceCentsStr.trim() === "" ? null : parseInt(monthlyPriceCentsStr, 10))
    : undefined;

  await updatePlan(planId, { 
    name, 
    active,
    monthly_price_cents: monthlyPriceCents
  });
  revalidatePath("/platform/plans");
}

async function updatePlanLimitsAction(formData: FormData) {
  "use server";
  
  await requirePlatformRole();
  
  const planId = formData.get("planId") as string;
  
  if (!planId) {
    throw new Error("Missing plan ID");
  }

  // Collect all limit values from form
  const limits: Record<string, number | string | null> = {};
  
  // Get existing limits
  const plan = await getPlanById(planId);
  if (plan) {
    for (const limit of plan.limits) {
      const value = formData.get(`limit-${limit.key}`);
      if (value !== null) {
        const strValue = value.toString().trim();
        if (strValue === "") {
          limits[limit.key] = null; // Delete limit
        } else {
          // Try to parse as number, otherwise use as string
          const numValue = Number(strValue);
          limits[limit.key] = isNaN(numValue) ? strValue : numValue;
        }
      }
    }
  }

  // Handle new limit
  const newKey = formData.get("new-limit-key")?.toString().trim();
  const newValue = formData.get("new-limit-value")?.toString().trim();
  
  if (newKey && newValue) {
    const numValue = Number(newValue);
    limits[newKey] = isNaN(numValue) ? newValue : numValue;
  }
  
  await updatePlanLimits(planId, limits);
  revalidatePath("/platform/plans");
}

export default async function PlansPage() {
  // Protect with platform role guard
  await requirePlatformRole();

  // Fetch all plans
  const plans = await getAllPlans();

  // Fetch limits for each plan
  const plansWithLimits = await Promise.all(
    plans.map(async (plan) => {
      const planWithLimits = await getPlanById(plan.id);
      return planWithLimits || { ...plan, limits: [] };
    })
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Platform Plans</h1>
        <p className="text-muted-foreground mt-2">
          Manage subscription plans and their limits
        </p>
      </div>

      {plansWithLimits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No plans found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {plansWithLimits.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              updatePlanAction={updatePlanAction}
              updatePlanLimitsAction={updatePlanLimitsAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  updatePlanAction,
  updatePlanLimitsAction,
}: {
  plan: {
    id: string;
    code: string;
    name: string;
    active: boolean;
    monthly_price_cents: number | null;
    limits: Array<{
      id: string;
      key: string;
      value: number | null;
      value_text: string | null;
    }>;
  };
  updatePlanAction: (formData: FormData) => Promise<void>;
  updatePlanLimitsAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="border rounded-lg p-6">
      <form action={updatePlanAction} className="space-y-4">
        <input type="hidden" name="planId" value={plan.id} />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-1">
              Code
            </label>
            <code className="text-sm bg-muted px-2 py-1 rounded block">
              {plan.code}
            </code>
          </div>

          <div>
            <label
              htmlFor={`name-${plan.id}`}
              className="text-sm font-semibold text-muted-foreground block mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id={`name-${plan.id}`}
              name="name"
              defaultValue={plan.name}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor={`monthly_price_cents-${plan.id}`}
              className="text-sm font-semibold text-muted-foreground block mb-1"
            >
              Monthly Price (cents)
            </label>
            <input
              type="number"
              id={`monthly_price_cents-${plan.id}`}
              name="monthly_price_cents"
              defaultValue={plan.monthly_price_cents ?? ""}
              placeholder="e.g. 9999 for $99.99"
              min="0"
              step="1"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor={`active-${plan.id}`}
              className="text-sm font-semibold text-muted-foreground block mb-1"
            >
              Active
            </label>
            <select
              id={`active-${plan.id}`}
              name="active"
              defaultValue={plan.active ? "true" : "false"}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Update Plan
          </button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t">
        <h3 className="text-lg font-semibold mb-4">Plan Limits</h3>
        
        <form action={updatePlanLimitsAction} className="space-y-4">
          <input type="hidden" name="planId" value={plan.id} />
          
          <div className="space-y-2">
            {plan.limits.map((limit) => (
              <div key={limit.id} className="flex items-center gap-4">
                <label className="text-sm font-medium w-32">
                  {limit.key}:
                </label>
                <input
                  type={limit.value !== null ? "number" : "text"}
                  name={`limit-${limit.key}`}
                  defaultValue={
                    limit.value !== null ? limit.value : limit.value_text || ""
                  }
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Enter value"
                />
              </div>
            ))}
            
            {/* Add new limit */}
            <div className="flex items-center gap-4 pt-2 border-t">
              <input
                type="text"
                name="new-limit-key"
                placeholder="Limit key (e.g., max_drivers)"
                className="w-32 px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                name="new-limit-value"
                placeholder="Limit value"
                className="flex-1 px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Update Limits
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

