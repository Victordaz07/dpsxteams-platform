"use client";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Create Supabase browser client with optional JWT token
 * 
 * IMPORTANT: JWT is passed via Authorization header, NOT via auth.setSession()
 * 
 * @param accessToken - Optional Supabase JWT token (from /api/supabase/token)
 * @returns Supabase client instance
 */
export function createBrowserClient(accessToken?: string) {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: "app",
      },
      global: {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

// Default export for backward compatibility
export const supabaseClient = createBrowserClient();
