import { requirePlatformRole } from "@/lib/auth/guards";
import { getAllTenants } from "@/lib/platform/tenants";

export default async function TenantsPage() {
  // Protect with platform role guard
  await requirePlatformRole();

  // Fetch all tenants
  const tenants = await getAllTenants();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Platform Tenants</h1>
        <p className="text-muted-foreground mt-2">
          Manage and view all tenant organizations
        </p>
      </div>

      {tenants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tenants found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="border-t hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4">{tenant.name}</td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {tenant.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tenant.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(tenant.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`/platform/tenants/${tenant.id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

