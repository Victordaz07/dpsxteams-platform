import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/auth/session";
import { signSupabaseJwt } from "@/lib/auth/supabase-jwt";
import { env } from "@/lib/env";

/**
 * Get server client with user context
 * 
 * Signs a Supabase JWT per-request with firebase_uid claim.
 * JWT is passed via Authorization header for RLS to work.
 */
export async function getServerClient() {
  const user = await getCurrentUser();

  if (!user) {
    // Return client without auth for public access
    return {
      client: createClient(
        env.NEXT_PUBLIC_SUPABASE_URL!,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          db: {
            schema: "app",
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      ),
      user: null,
    };
  }

  // Sign JWT with firebase_uid for RLS
  const token = signSupabaseJwt(user.uid);

  const client = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: "app",
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return { client, user };
}
