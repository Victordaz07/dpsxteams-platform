import { requirePlatformRole } from "@/lib/auth/guards";
import { getTenantById } from "@/lib/platform/tenants";
import { notFound } from "next/navigation";
import Link from "next/link";

interface TenantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantDetailPage({
  params,
}: TenantDetailPageProps) {
  // Protect with platform role guard
  await requirePlatformRole();

  const { id } = await params;

  // Fetch tenant
  const tenant = await getTenantById(id);

  if (!tenant) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link
          href="/platform/tenants"
          className="text-primary hover:underline text-sm mb-4 inline-block"
        >
          ← Back to Tenants
        </Link>
        <h1 className="text-3xl font-bold mt-2">Tenant Details</h1>
        <p className="text-muted-foreground mt-2">
          View tenant organization information
        </p>
      </div>

      <div className="border rounded-lg p-6 max-w-2xl">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-semibold text-muted-foreground">
              ID
            </dt>
            <dd className="mt-1">
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {tenant.id}
              </code>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-semibold text-muted-foreground">
              Name
            </dt>
            <dd className="mt-1 text-lg">{tenant.name}</dd>
          </div>

          <div>
            <dt className="text-sm font-semibold text-muted-foreground">
              Slug
            </dt>
            <dd className="mt-1">
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {tenant.slug}
              </code>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-semibold text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tenant.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {tenant.status}
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-semibold text-muted-foreground">
              Created At
            </dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              {new Date(tenant.created_at).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

