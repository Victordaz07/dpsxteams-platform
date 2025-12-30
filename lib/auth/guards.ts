import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";
import { getCurrentUserRole, checkPermission } from "./rbac";
import { getValidatedActiveOrgId } from "./active-org";
import { getServerClient } from "@/lib/supabase/server";
import { hasPermission } from "./permissions";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "./nextauth-config";
import type { Role } from "./roles";
import type { Permission } from "./permissions";

/**
 * Require authentication
 * Throws redirect to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

/**
 * Require active organization
 * Throws redirect to select-org if no active org
 */
export async function requireActiveOrg() {
  const orgId = await getValidatedActiveOrgId();
  if (!orgId) {
    redirect("/select-org");
  }
  return orgId;
}

/**
 * Require specific role
 * Throws redirect if user doesn't have the role
 */
export async function requireRole(requiredRole: Role) {
  await requireAuth();
  await requireActiveOrg();

  const role = await getCurrentUserRole();
  if (!role || role !== requiredRole) {
    redirect("/admin"); // Or appropriate error page
  }

  return role;
}

/**
 * Require one of the specified roles
 */
export async function requireAnyRole(requiredRoles: Role[]) {
  await requireAuth();
  await requireActiveOrg();

  const role = await getCurrentUserRole();
  if (!role || !requiredRoles.includes(role)) {
    redirect("/admin");
  }

  return role;
}

/**
 * Require access to a specific organization
 * Verifies user has active membership in the organization
 */
export async function requireOrgAccess(organizationId: string) {
  const user = await requireAuth();

  const { client } = await getServerClient();

  // Get user's app.users record
  const { data: appUser, error: userError } = await client
    .from("users")
    .select("id")
    .eq("firebase_uid", user.uid)
    .single();

  if (userError || !appUser) {
    redirect("/auth/login");
  }

  // Verify membership
  const { data: membership, error: membershipError } = await client
    .from("memberships")
    .select("id")
    .eq("user_id", appUser.id)
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .single();

  if (membershipError || !membership) {
    redirect("/select-org");
  }

  return { user, organizationId, membership };
}

/**
 * Require specific permission
 * Throws redirect if user doesn't have the permission
 */
export async function requirePermission(permission: Permission) {
  await requireAuth();
  await requireActiveOrg();

  const hasAccess = await checkPermission(permission);
  if (!hasAccess) {
    redirect("/admin"); // Or appropriate error page
  }

  return true;
}

/**
 * Require any of the specified permissions
 */
export async function requireAnyPermission(permissions: Permission[]) {
  await requireAuth();
  await requireActiveOrg();

  const role = await getCurrentUserRole();
  if (!role) {
    redirect("/admin");
  }

  const hasAccess = permissions.some((perm) => hasPermission(role, perm));

  if (!hasAccess) {
    redirect("/admin");
  }

  return true;
}

/**
 * Require platform role (PLATFORM_OWNER or PLATFORM_ADMIN)
 * Server-only guard for Platform Console routes
 * Throws 403 error if user is not authorized
 */
export async function requirePlatformRole() {
  const session = await getServerSession(nextAuthConfig);

  if (!session || !session.user) {
    const error = new Error("Unauthorized: No session found");
    (error as any).statusCode = 401;
    throw error;
  }

  const role = session.user.role;

  if (!role || (role !== "PLATFORM_OWNER" && role !== "PLATFORM_ADMIN")) {
    const error = new Error("Forbidden: Platform role required");
    (error as any).statusCode = 403;
    throw error;
  }

  return {
    user: session.user,
    role: role as "PLATFORM_OWNER" | "PLATFORM_ADMIN",
  };
}

