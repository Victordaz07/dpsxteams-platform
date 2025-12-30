import { getServerClient } from "@/lib/supabase/server";

/**
 * Get all organizations for a user (by firebase_uid)
 */
export async function getUserOrganizations(firebase_uid: string) {
  const { client } = await getServerClient();

  // Get user's app.users record first
  const { data: appUser, error: userError } = await client
    .from("users")
    .select("id")
    .eq("firebase_uid", firebase_uid)
    .single();

  if (userError || !appUser) {
    return null;
  }

  // Get organizations via memberships
  const { data, error } = await client
    .from("memberships")
    .select("organization_id, organizations(*)")
    .eq("user_id", appUser.id)
    .eq("status", "active");

  if (error || !data) {
    return null;
  }

  return data.map((m: any) => m.organizations);
}

/**
 * Get active organization for current user
 */
export async function getActiveOrganization() {
  const { client, user } = await getServerClient();

  if (!user) {
    return null;
  }

  // Get user's app.users record first
  const { data: appUser, error: userError } = await client
    .from("users")
    .select("id")
    .eq("firebase_uid", user.uid)
    .single();

  if (userError || !appUser) {
    return null;
  }

  // Get first active organization
  const { data, error } = await client
    .from("memberships")
    .select("organization_id, organizations(*)")
    .eq("user_id", appUser.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data.organizations;
}

/**
 * Get organization by ID (with access check)
 */
export async function getOrganizationById(organizationId: string) {
  const { client, user } = await getServerClient();

  if (!user) {
    return null;
  }

  // Get user's app.users record first
  const { data: appUser, error: userError } = await client
    .from("users")
    .select("id")
    .eq("firebase_uid", user.uid)
    .single();

  if (userError || !appUser) {
    return null;
  }

  // Verify user has access to this organization
  const { data: membership, error: membershipError } = await client
    .from("memberships")
    .select("organization_id")
    .eq("user_id", appUser.id)
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .single();

  if (membershipError || !membership) {
    return null; // User doesn't have access
  }

  // Get organization details
  const { data, error } = await client
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
