import { requirePlatformRole } from "@/lib/auth/guards";
import { getMetrics, getMRR, getActiveTenantsCount, getChurnRate } from "@/lib/platform/metrics";

export default async function MetricsPage() {
  // Protect with platform role guard
  await requirePlatformRole();

  // Fetch all metrics
  const metrics = await getMetrics();

  // Calculate churn for different periods
  const now = new Date();
  const last7Days = new Date(now);
  last7Days.setDate(last7Days.getDate() - 7);
  const last30Days = new Date(now);
  last30Days.setDate(last30Days.getDate() - 30);
  const last90Days = new Date(now);
  last90Days.setDate(last90Days.getDate() - 90);

  const [churn7d, churn30d, churn90d] = await Promise.all([
    getChurnRate({ start: last7Days, end: now }),
    getChurnRate({ start: last30Days, end: now }),
    getChurnRate({ start: last90Days, end: now }),
  ]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <a
          href="/platform"
          className="text-primary hover:underline text-sm mb-4 inline-block"
        >
          ← Back to Dashboard
        </a>
        <h1 className="text-3xl font-bold mt-2">Platform Metrics</h1>
        <p className="text-muted-foreground mt-2">
          Detailed analytics and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-6">
          <div className="text-sm font-semibold text-muted-foreground mb-1">
            Monthly Recurring Revenue
          </div>
          <div className="text-4xl font-bold">${metrics.mrr.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-2">
            From active and trialing subscriptions
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="text-sm font-semibold text-muted-foreground mb-1">
            Active Tenants
          </div>
          <div className="text-4xl font-bold">{metrics.activeTenants}</div>
          <div className="text-xs text-muted-foreground mt-2">
            Organizations with active subscriptions
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="text-sm font-semibold text-muted-foreground mb-1">
            Churn Rate (30d)
          </div>
          <div className="text-4xl font-bold">{metrics.churnRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground mt-2">
            Canceled subscriptions / active at start
          </div>
        </div>
      </div>

      {/* Churn Rate by Period */}
      <div className="border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Churn Rate by Period</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Last 7 Days</div>
            <div className="text-3xl font-bold">{churn7d.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Last 30 Days</div>
            <div className="text-3xl font-bold">{churn30d.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Last 90 Days</div>
            <div className="text-3xl font-bold">{churn90d.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Subscription Status Breakdown */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Subscription Status Breakdown
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Active</span>
            </div>
            <div className="font-semibold">
              {metrics.activeTenants}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Trialing</span>
            </div>
            <div className="font-semibold">
              {metrics.trialingSubscriptions}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Past Due</span>
            </div>
            <div className="font-semibold">
              {metrics.pastDueSubscriptions}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span>Canceled</span>
            </div>
            <div className="font-semibold">
              {metrics.canceledSubscriptions}
            </div>
          </div>
          <div className="border-t pt-4 flex items-center justify-between">
            <div className="font-semibold">Total</div>
            <div className="font-bold text-lg">
              {metrics.totalSubscriptions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

