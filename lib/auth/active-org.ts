import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { getServerClient } from "@/lib/supabase/server";

/**
 * Get active organization ID from cookie
 * Returns null if cookie doesn't exist or is invalid
 */
export async function getActiveOrganizationId(): Promise<string | null> {
  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get("active_org_id")?.value;

  if (!activeOrgId) {
    return null;
  }

  return activeOrgId;
}

/**
 * Validate that the active organization belongs to the current user
 * If invalid, clears cookie and returns null
 */
export async function validateActiveOrg(
  organizationId: string
): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const { client } = await getServerClient();

  // Get user's app.users record
  const { data: appUser, error: userError } = await client
    .from("users")
    .select("id")
    .eq("firebase_uid", user.uid)
    .single();

  if (userError || !appUser) {
    return false;
  }

  // Verify membership exists and is active
  const { data: membership, error: membershipError } = await client
    .from("memberships")
    .select("id")
    .eq("user_id", appUser.id)
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .single();

  if (membershipError || !membership) {
    // Invalid membership - clear cookie
    const cookieStore = await cookies();
    cookieStore.delete("active_org_id");
    return false;
  }

  return true;
}

/**
 * Get validated active organization ID
 * Returns null if cookie doesn't exist, is invalid, or user doesn't have access
 */
export async function getValidatedActiveOrgId(): Promise<string | null> {
  const orgId = await getActiveOrganizationId();

  if (!orgId) {
    return null;
  }

  const isValid = await validateActiveOrg(orgId);

  return isValid ? orgId : null;
}

