import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Platform schema client - uses service role for platform.* queries
 * This bypasses RLS and should ONLY be used in server routes
 * NEVER expose this to the client
 */
export function getPlatformClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      db: {
        schema: "platform",
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

