import { requirePlatformRole } from "@/lib/auth/guards";
import { getAllSubscriptions } from "@/lib/platform/subscriptions";
import Link from "next/link";

interface SubscriptionsPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function SubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  // Protect with platform role guard
  await requirePlatformRole();

  const params = await searchParams;
  const status = params.status as
    | "active"
    | "trialing"
    | "canceled"
    | "past_due"
    | "incomplete"
    | undefined;
  const searchQuery = params.q;
  const page = parseInt(params.page || "1", 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Fetch subscriptions
  const subscriptions = await getAllSubscriptions(
    {
      status,
      q: searchQuery,
    },
    { limit, offset }
  );

  // Calculate total pages (approximate - we'd need a count query for exact)
  const hasMore = subscriptions.length === limit;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Platform Subscriptions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all subscription subscriptions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-end">
        <form method="get" className="flex gap-4 items-end flex-1">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="text-sm font-semibold text-muted-foreground block mb-1"
            >
              Search
            </label>
            <input
              type="text"
              id="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Organization name, Stripe ID..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="text-sm font-semibold text-muted-foreground block mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status || "all"}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Filter
          </button>

          {searchQuery && (
            <a
              href="/platform/subscriptions"
              className="px-4 py-2 border rounded-md hover:bg-muted"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No subscriptions found</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Stripe Subscription ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-t hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/platform/tenants/${sub.organization_id}`}
                        className="text-primary hover:underline"
                      >
                        {sub.organization.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {sub.organization.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{sub.plan.name}</div>
                      <code className="text-xs text-muted-foreground">
                        {sub.plan.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sub.status === "active"
                            ? "bg-green-100 text-green-800"
                            : sub.status === "trialing"
                            ? "bg-blue-100 text-blue-800"
                            : sub.status === "past_due"
                            ? "bg-yellow-100 text-yellow-800"
                            : sub.status === "canceled"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {sub.current_period_start && sub.current_period_end ? (
                        <div>
                          {new Date(sub.current_period_start).toLocaleDateString()} -{" "}
                          {new Date(sub.current_period_end).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {sub.stripe_subscription_id}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(sub.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Page {page} {hasMore && "(more available)"}
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`/platform/subscriptions?${new URLSearchParams({
                    ...(status && { status }),
                    ...(searchQuery && { q: searchQuery }),
                    page: String(page - 1),
                  }).toString()}`}
                  className="px-4 py-2 border rounded-md hover:bg-muted"
                >
                  Previous
                </a>
              )}
              {hasMore && (
                <a
                  href={`/platform/subscriptions?${new URLSearchParams({
                    ...(status && { status }),
                    ...(searchQuery && { q: searchQuery }),
                    page: String(page + 1),
                  }).toString()}`}
                  className="px-4 py-2 border rounded-md hover:bg-muted"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

