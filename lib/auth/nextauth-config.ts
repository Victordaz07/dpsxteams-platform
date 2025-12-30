import { NextAuthOptions } from "next-auth";
import { getServiceClient } from "@/lib/supabase/service";
import { firebaseAdminAuth } from "@/lib/firebase/admin";
import { env } from "@/lib/env";
import { getSessionCookie } from "./session";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

/**
 * NextAuth configuration for Platform Console
 * Uses Firebase Auth as identity provider
 * Fetches platform role from platform.users table
 */
export const nextAuthConfig: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, trigger, user }) {
      // On initial sign in (trigger === "signIn")
      if (trigger === "signIn" && user) {
        // User object comes from authorize() function
        token.firebaseUid = user.id;
        token.email = user.email || undefined;
        token.name = user.name || undefined;
        token.role = (user as any).role || null;
        token.platform_user_id = (user as any).platform_user_id || null;
        return token;
      }

      // On subsequent requests, verify Firebase session and refresh role
      if (!token.firebaseUid) {
        // Try to get Firebase session cookie
        try {
          const sessionCookie = await getSessionCookie();
          if (!sessionCookie) {
            // No Firebase cookie - block access
            token.role = null;
            token.platform_user_id = null;
            return token;
          }

          // Verify Firebase session cookie
          const decodedClaims = await firebaseAdminAuth.verifySessionCookie(
            sessionCookie,
            true // checkRevoked
          );

          token.firebaseUid = decodedClaims.uid;
          token.email = decodedClaims.email || undefined;
          token.name = decodedClaims.name || undefined;

          // Fetch platform user from database using service role
          const client = getServiceClient();
          const { data: platformUser, error } = await client
            .schema("platform")
            .from("users")
            .select("id, role, active")
            .eq("firebase_uid", decodedClaims.uid)
            .eq("active", true)
            .single();

          if (error || !platformUser) {
            // User is not a platform user - block access
            token.role = null;
            token.platform_user_id = null;
            return token;
          }

          // Store role and platform_user_id in token
          token.role = platformUser.role;
          token.platform_user_id = platformUser.id;
        } catch (error) {
          console.error("Error verifying Firebase session or fetching role:", error);
          token.role = null;
          token.platform_user_id = null;
        }
      } else if (token.firebaseUid) {
        // On subsequent requests, refresh role and platform_user_id from database
        try {
          const client = getServiceClient();
          const { data: platformUser, error } = await client
            .schema("platform")
            .from("users")
            .select("id, role, active")
            .eq("firebase_uid", token.firebaseUid)
            .eq("active", true)
            .single();

          if (error || !platformUser) {
            // User no longer exists or is inactive - block access
            token.role = null;
            token.platform_user_id = null;
          } else {
            token.role = platformUser.role;
            token.platform_user_id = platformUser.id;
          }
        } catch (error) {
          console.error("Error refreshing platform role:", error);
          token.role = null;
          token.platform_user_id = null;
        }
      }

      return token;
    },
    async session({ session, token }): Promise<Session> {
      // Expose role and platform_user_id in session
      if (session.user) {
        session.user.role = token.role as "PLATFORM_OWNER" | "PLATFORM_ADMIN" | undefined;
        session.user.platform_user_id = token.platform_user_id || undefined;
      }
      return session;
    },
  },
  providers: [
    // Custom Firebase provider - verifies Firebase session cookie
    {
      id: "firebase",
      name: "Firebase",
      type: "credentials",
      credentials: {},
      async authorize() {
        try {
          // Get Firebase session cookie
          const sessionCookie = await getSessionCookie();
          if (!sessionCookie) {
            return null;
          }

          // Verify Firebase session cookie
          const decodedClaims = await firebaseAdminAuth.verifySessionCookie(
            sessionCookie,
            true // checkRevoked
          );

          // Fetch platform user from database using service role
          const client = getServiceClient();
          const { data: platformUser, error } = await client
            .schema("platform")
            .from("users")
            .select("id, role, active, email, name")
            .eq("firebase_uid", decodedClaims.uid)
            .eq("active", true)
            .single();

          if (error || !platformUser) {
            // User is not a platform user - do NOT auto-create, block access
            return null;
          }

          // Return user object with role and platform_user_id
          return {
            id: decodedClaims.uid,
            email: platformUser.email || decodedClaims.email || null,
            name: platformUser.name || decodedClaims.name || null,
            role: platformUser.role,
            platform_user_id: platformUser.id,
          };
        } catch (error) {
          console.error("Error in Firebase authorize:", error);
          return null;
        }
      },
    },
  ],
};

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      role?: "PLATFORM_OWNER" | "PLATFORM_ADMIN";
      platform_user_id?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    firebaseUid?: string;
    role?: "PLATFORM_OWNER" | "PLATFORM_ADMIN" | null;
    platform_user_id?: string | null;
  }
}

