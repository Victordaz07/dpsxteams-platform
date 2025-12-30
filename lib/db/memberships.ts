import { getServerClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

/**
 * Get or create user in app.users
 * Uses service role for upsert
 */
export async function getOrCreateUser(
  firebase_uid: string,
  email?: string | null,
  name?: string | null
) {
  const { data: user, error } = await supabaseService
    .from("users")
    .upsert(
      {
        firebase_uid,
        email: email || null,
        name: name || null,
        status: "active",
      },
      {
        onConflict: "firebase_uid",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to get or create user: ${error.message}`);
  }

  return user;
}

/**
 * Get all memberships for current user
 */
export async function getUserMemberships() {
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

  // Get all memberships
  const { data, error } = await client
    .from("memberships")
    .select("*, organizations(*)")
    .eq("user_id", appUser.id)
    .eq("status", "active");

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Get all memberships for user's organization
 */
export async function getOrganizationMemberships(organizationId: string) {
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
  const { data: userMembership, error: membershipCheckError } = await client
    .from("memberships")
    .select("organization_id")
    .eq("user_id", appUser.id)
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .single();

  if (membershipCheckError || !userMembership) {
    return null; // User doesn't have access
  }

  // Get all memberships for this organization
  const { data, error } = await client
    .from("memberships")
    .select("*, users(*)")
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (error) {
    return null;
  }

  return data;
}

/**
 * Create membership (uses service role for insert)
 * Requires user_id (from app.users), not firebase_uid
 */
export async function createMembership(
  user_id: string,
  organization_id: string,
  role: string
) {
  const { data, error } = await supabaseService
    .from("memberships")
    .insert({
      user_id,
      organization_id,
      role,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create membership: ${error.message}`);
  }

  return data;
}
