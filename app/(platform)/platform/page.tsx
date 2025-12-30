import { requirePlatformRole } from "@/lib/auth/guards";
import { getMetrics } from "@/lib/platform/metrics";
import Link from "next/link";

export default async function PlatformDashboard() {
  // Protect with platform role guard
  await requirePlatformRole();

  // Fetch metrics
  const metrics = await getMetrics();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Platform Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your SaaS platform
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="border rounded-lg p-6">
          <div className="text-sm font-semibold text-muted-foreground mb-1">
            MRR
          </div>
          <div className="text-3xl font-bold">
            ${metrics.mrr.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Monthly Recurring Revenue
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="text-sm font-semibold text-muted-foreground mb-1">
            Active Tenants
          </div>
          <div className="text-3xl font-bold">{metrics.activeTenants}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Organizations with active subscriptions
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="text-sm font-semibold text-muted-foreground mb-1">
            Churn Rate
          </div>
          <div className="text-3xl font-bold">
            {metrics.churnRate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Last 30 days
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="text-sm font-semibold text-muted-foreground mb-1">
            Total Subscriptions
          </div>
          <div className="text-3xl font-bold">
            {metrics.totalSubscriptions}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            All time
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/platform/metrics"
            className="p-4 border rounded-lg hover:bg-muted transition-colors"
          >
            <div className="font-semibold">Detailed Metrics</div>
            <div className="text-sm text-muted-foreground mt-1">
              View comprehensive analytics
            </div>
          </Link>

          <Link
            href="/platform/subscriptions"
            className="p-4 border rounded-lg hover:bg-muted transition-colors"
          >
            <div className="font-semibold">Subscriptions</div>
            <div className="text-sm text-muted-foreground mt-1">
              Manage all subscriptions
            </div>
          </Link>

          <Link
            href="/platform/tenants"
            className="p-4 border rounded-lg hover:bg-muted transition-colors"
          >
            <div className="font-semibold">Tenants</div>
            <div className="text-sm text-muted-foreground mt-1">
              View all organizations
            </div>
          </Link>

          <Link
            href="/platform/plans"
            className="p-4 border rounded-lg hover:bg-muted transition-colors"
          >
            <div className="font-semibold">Plans</div>
            <div className="text-sm text-muted-foreground mt-1">
              Manage subscription plans
            </div>
          </Link>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="mt-8 border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Trialing</div>
            <div className="text-2xl font-bold">{metrics.trialingSubscriptions}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Past Due</div>
            <div className="text-2xl font-bold">{metrics.pastDueSubscriptions}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Canceled</div>
            <div className="text-2xl font-bold">{metrics.canceledSubscriptions}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{metrics.totalSubscriptions}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

