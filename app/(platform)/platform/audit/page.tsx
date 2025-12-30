import { requirePlatformRole } from "@/lib/auth/guards";
import { getAuditLogs } from "@/lib/platform/audit";

interface AuditPageProps {
  searchParams: Promise<{
    action_type?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
    page?: string;
  }>;
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
  // Protect with platform role guard
  await requirePlatformRole();

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Parse dates if provided
  const startDate = params.start_date
    ? new Date(params.start_date)
    : undefined;
  const endDate = params.end_date ? new Date(params.end_date) : undefined;

  // Fetch audit logs
  const logs = await getAuditLogs(
    {
      action_type: params.action_type,
      entity_type: params.entity_type,
      start_date: startDate,
      end_date: endDate,
    },
    { limit, offset }
  );

  const hasMore = logs.length === limit;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Platform Audit Log</h1>
        <p className="text-muted-foreground mt-2">
          Track all platform actions and changes
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 border rounded-lg p-4">
        <form method="get" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="action_type"
              className="text-sm font-semibold text-muted-foreground block mb-1"
            >
              Action Type
            </label>
            <select
              id="action_type"
              name="action_type"
              defaultValue={params.action_type || "all"}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="all">All</option>
              <option value="plan_updated">Plan Updated</option>
              <option value="plan_limits_updated">Plan Limits Updated</option>
              <option value="tenant_updated">Tenant Updated</option>
              <option value="tenant_deactivated">Tenant Deactivated</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="entity_type"
              className="text-sm font-semibold text-muted-foreground block mb-1"
            >
              Entity Type
            </label>
            <select
              id="entity_type"
              name="entity_type"
              defaultValue={params.entity_type || "all"}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="all">All</option>
              <option value="plan">Plan</option>
              <option value="tenant">Tenant</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="start_date"
              className="text-sm font-semibold text-muted-foreground block mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              defaultValue={params.start_date}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="end_date"
              className="text-sm font-semibold text-muted-foreground block mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              defaultValue={params.end_date}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="md:col-span-4 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Filter
            </button>
            {(params.action_type ||
              params.entity_type ||
              params.start_date ||
              params.end_date) && (
              <a
                href="/platform/audit"
                className="px-4 py-2 border rounded-md hover:bg-muted"
              >
                Clear Filters
              </a>
            )}
          </div>
        </form>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No audit logs found</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Changes
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div>
                          <div className="font-medium">{log.user.email}</div>
                          {log.user.name && (
                            <div className="text-xs text-muted-foreground">
                              {log.user.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          System
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{log.entity_type}</div>
                        <code className="text-xs text-muted-foreground">
                          {log.entity_id}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.changes ? (
                        <details className="cursor-pointer">
                          <summary className="text-sm text-primary hover:underline">
                            View Changes
                          </summary>
                          <div className="mt-2 p-3 bg-muted rounded text-xs font-mono overflow-auto max-h-48">
                            <div className="mb-2">
                              <strong>Before:</strong>
                              <pre className="mt-1">
                                {JSON.stringify(log.changes.before, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <strong>After:</strong>
                              <pre className="mt-1">
                                {JSON.stringify(log.changes.after, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </details>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
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
                  href={`/platform/audit?${new URLSearchParams({
                    ...(params.action_type && { action_type: params.action_type }),
                    ...(params.entity_type && { entity_type: params.entity_type }),
                    ...(params.start_date && { start_date: params.start_date }),
                    ...(params.end_date && { end_date: params.end_date }),
                    page: String(page - 1),
                  }).toString()}`}
                  className="px-4 py-2 border rounded-md hover:bg-muted"
                >
                  Previous
                </a>
              )}
              {hasMore && (
                <a
                  href={`/platform/audit?${new URLSearchParams({
                    ...(params.action_type && { action_type: params.action_type }),
                    ...(params.entity_type && { entity_type: params.entity_type }),
                    ...(params.start_date && { start_date: params.start_date }),
                    ...(params.end_date && { end_date: params.end_date }),
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

