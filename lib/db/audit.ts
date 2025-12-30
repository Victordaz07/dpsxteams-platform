import { supabaseService } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/auth/session";
import { getValidatedActiveOrgId } from "@/lib/auth/active-org";
import { getServerClient } from "@/lib/supabase/server";

interface AuditLogData {
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Create an audit log entry
 * Uses service role to bypass RLS for INSERT
 */
export async function createAuditLog(data: AuditLogData) {
  const user = await getCurrentUser();
  const orgId = await getValidatedActiveOrgId();

  if (!user || !orgId) {
    // Can't create audit log without user/org context
    return null;
  }

  // Get user's app.users record
  const { client } = await getServerClient();
  const { data: appUser, error: userError } = await client
    .from("users")
    .select("id")
    .eq("firebase_uid", user.uid)
    .single();

  if (userError || !appUser) {
    return null;
  }

  // Insert audit log using service role
  const { data, error } = await supabaseService
    .from("audit_logs")
    .insert({
      organization_id: orgId,
      user_id: appUser.id,
      action: data.action,
      resource_type: data.resource_type || null,
      resource_id: data.resource_id || null,
      details: data.details || null,
      ip_address: data.ip_address || null,
      user_agent: data.user_agent || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating audit log:", error);
    return null;
  }

  return data;
}

/**
 * Get audit logs for current organization
 */
export async function getAuditLogs(limit = 100) {
  const orgId = await getValidatedActiveOrgId();
  if (!orgId) {
    return null;
  }

  const { client } = await getServerClient();

  const { data, error } = await client
    .from("audit_logs")
    .select("*, users(firebase_uid, email)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching audit logs:", error);
    return null;
  }

  return data;
}

