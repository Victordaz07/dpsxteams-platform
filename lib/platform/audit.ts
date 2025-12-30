import { getServiceClient } from "@/lib/supabase/service";

/**
 * Audit log type
 */
export type AuditLog = {
  id: string;
  user_id: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string;
  changes: { before: any; after: any } | null;
  created_at: string;
  // Joined user data
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
};

/**
 * Audit log filters
 */
export type AuditFilters = {
  action_type?: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  start_date?: Date;
  end_date?: Date;
};

/**
 * Pagination options
 */
export type PaginationOptions = {
  limit?: number;
  offset?: number;
};

/**
 * Log an action to audit log
 * Changes must always be { before, after } structure (even if one is null)
 */
export async function logAction(
  platformUserId: string | null,
  actionType: string,
  entityType: string,
  entityId: string,
  changes?: { before: any; after: any }
): Promise<AuditLog> {
  const client = getServiceClient();

  // Ensure changes has { before, after } structure
  const changesData = changes
    ? { before: changes.before ?? null, after: changes.after ?? null }
    : null;

  const { data, error } = await client
    .schema("platform")
    .from("audit_logs")
    .insert({
      user_id: platformUserId,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      changes: changesData,
    })
    .select("id, user_id, action_type, entity_type, entity_id, changes, created_at")
    .single();

  if (error) {
    console.error("Error logging audit action:", error);
    throw new Error("Failed to log audit action");
  }

  return data;
}

/**
 * Get audit logs with filters and pagination
 */
export async function getAuditLogs(
  filters?: AuditFilters,
  pagination?: PaginationOptions
): Promise<AuditLog[]> {
  const client = getServiceClient();

  const limit = pagination?.limit ?? 50;
  const offset = pagination?.offset ?? 0;

  let query = client
    .schema("platform")
    .from("audit_logs")
    .select("id, user_id, action_type, entity_type, entity_id, changes, created_at");

  // Apply filters
  if (filters?.action_type) {
    query = query.eq("action_type", filters.action_type);
  }
  if (filters?.entity_type) {
    query = query.eq("entity_type", filters.entity_type);
  }
  if (filters?.entity_id) {
    query = query.eq("entity_id", filters.entity_id);
  }
  if (filters?.user_id) {
    query = query.eq("user_id", filters.user_id);
  }
  if (filters?.start_date) {
    query = query.gte("created_at", filters.start_date.toISOString());
  }
  if (filters?.end_date) {
    query = query.lte("created_at", filters.end_date.toISOString());
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);
  query = query.order("created_at", { ascending: false });

  const { data: logs, error } = await query;

  if (error) {
    console.error("Error fetching audit logs:", error);
    throw new Error("Failed to fetch audit logs");
  }

  if (!logs || logs.length === 0) {
    return [];
  }

  // Extract unique user IDs for batch fetch (skip if empty to avoid IN([]))
  const userIds = [...new Set(logs.map((log) => log.user_id).filter((id): id is string => id !== null))];

  let users: Array<{ id: string; email: string; name: string | null }> = [];
  if (userIds.length > 0) {
    const { data: usersData, error: usersError } = await client
      .schema("platform")
      .from("users")
      .select("id, email, name")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching audit log users:", usersError);
      // Continue without user data rather than failing
    } else {
      users = usersData || [];
    }
  }

  // Create user map
  const userMap = new Map(users.map((user) => [user.id, user]));

  // Merge logs with user data
  return logs.map((log) => ({
    ...log,
    user: log.user_id ? userMap.get(log.user_id) : undefined,
  }));
}

