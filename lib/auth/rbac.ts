import { getCurrentUser } from "./session";
import { getServerClient } from "@/lib/supabase/server";
import { getValidatedActiveOrgId } from "./active-org";
import type { Role } from "./roles";
import type { Permission } from "./permissions";
import { hasPermission } from "./permissions";

/**
 * Get current user's role in the active organization
 */
export async function getCurrentUserRole(): Promise<Role | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const orgId = await getValidatedActiveOrgId();
  if (!orgId) {
    return null;
  }

  const { client } = await getServerClient();

  // Get user's app.users record
  const { data: appUser, error: userError } = await client
    .from("users")
    .select("id")
    .eq("firebase_uid", user.uid)
    .single();

  if (userError || !appUser) {
    return null;
  }

  // Get membership for active organization
  const { data: membership, error: membershipError } = await client
    .from("memberships")
    .select("role")
    .eq("user_id", appUser.id)
    .eq("organization_id", orgId)
    .eq("status", "active")
    .single();

  if (membershipError || !membership) {
    return null;
  }

  return membership.role as Role;
}

/**
 * Check if current user has a specific permission
 */
export async function checkPermission(
  permission: Permission
): Promise<boolean> {
  const role = await getCurrentUserRole();
  if (!role) {
    return false;
  }

  return hasPermission(role, permission);
}

/**
 * Get current user's role and organization context
 */
export async function getRBACContext(): Promise<{
  role: Role | null;
  organizationId: string | null;
  userId: string | null;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { role: null, organizationId: null, userId: null };
  }

  const orgId = await getValidatedActiveOrgId();
  if (!orgId) {
    return { role: null, organizationId: null, userId: user.uid };
  }

  const role = await getCurrentUserRole();

  return {
    role,
    organizationId: orgId,
    userId: user.uid,
  };
}

