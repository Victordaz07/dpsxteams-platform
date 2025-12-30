import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

/**
 * Sign a Supabase JWT with firebase_uid claim
 * This JWT is used for RLS policies in Supabase
 * 
 * @param firebase_uid - Firebase user ID
 * @returns Signed JWT token
 */
export function signSupabaseJwt(firebase_uid: string): string {
  const payload = {
    firebase_uid,
    iat: Math.floor(Date.now() / 1000),
  };

  // Expiration: 15 minutes
  const expiresIn = 15 * 60; // 15 minutes in seconds

  const token = jwt.sign(payload, env.SUPABASE_JWT_SECRET, {
    algorithm: "HS256",
    expiresIn,
  });

  return token;
}

