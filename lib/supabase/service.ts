import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Get service role client - schema-agnostic
 * Bypasses RLS and can query both platform.* and app.* schemas
 * ONLY use for Platform operations (server-side)
 * This should never be used for user-facing queries
 */
export function getServiceClient(): SupabaseClient {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      // No default schema - explicitly target schema in queries
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use getServiceClient() instead
 */
export const supabaseService = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: "app",
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

