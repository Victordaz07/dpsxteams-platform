import { getServiceClient } from "@/lib/supabase/service";
import { logAction } from "./audit";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/lib/auth/nextauth-config";

/**
 * Tenant (Organization) type
 */
export type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
};

/**
 * Get all tenants (organizations)
 * Uses service role to bypass RLS
 */
export async function getAllTenants(): Promise<Tenant[]> {
  const client = getServiceClient();

  const { data, error } = await client
    .schema("app")
    .from("organizations")
    .select("id, name, slug, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tenants:", error);
    throw new Error("Failed to fetch tenants");
  }

  return data || [];
}

/**
 * Get tenant by ID
 * Uses service role to bypass RLS
 */
export async function getTenantById(id: string): Promise<Tenant | null> {
  const client = getServiceClient();

  const { data, error } = await client
    .schema("app")
    .from("organizations")
    .select("id, name, slug, status, created_at")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Error fetching tenant:", error);
    throw new Error("Failed to fetch tenant");
  }

  return data;
}

/**
 * Update tenant
 * Uses service role to bypass RLS
 */
export async function updateTenant(
  id: string,
  data: { name?: string; slug?: string; status?: string }
): Promise<Tenant> {
  const client = getServiceClient();

  // Get old tenant for audit log
  const oldTenant = await getTenantById(id);

  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.slug !== undefined) {
    updateData.slug = data.slug;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  const { data: tenant, error } = await client
    .schema("app")
    .from("organizations")
    .update(updateData)
    .eq("id", id)
    .select("id, name, slug, status, created_at")
    .single();

  if (error) {
    console.error("Error updating tenant:", error);
    throw new Error("Failed to update tenant");
  }

  // Log audit action
  try {
    const session = await getServerSession(nextAuthConfig);
    const platformUserId = session?.user?.platform_user_id || null;

    if (platformUserId) {
      await logAction(
        platformUserId,
        "tenant_updated",
        "tenant",
        id,
        {
          before: oldTenant
            ? {
                name: oldTenant.name,
                slug: oldTenant.slug,
                status: oldTenant.status,
              }
            : null,
          after: {
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
          },
        }
      );
    }
  } catch (auditError) {
    // Don't fail the update if audit logging fails
    console.error("Error logging audit action:", auditError);
  }

  return tenant;
}

/**
 * Deactivate tenant
 * Sets tenant status to 'inactive'
 */
export async function deactivateTenant(id: string): Promise<Tenant> {
  return updateTenant(id, { status: "inactive" });
}

