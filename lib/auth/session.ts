import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/admin";
import { env } from "@/lib/env";
import type { DecodedIdToken } from "firebase-admin/auth";

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(env.AUTH_COOKIE_NAME)?.value;
}

export async function getCurrentUser(): Promise<DecodedIdToken | null> {
  try {
    const sessionCookie = await getSessionCookie();

    if (!sessionCookie) {
      return null;
    }

    // Verificar la session cookie con Firebase Admin
    const decodedClaims = await firebaseAdminAuth.verifySessionCookie(
      sessionCookie,
      true // checkRevoked
    );

    return decodedClaims;
  } catch (error) {
    // Si la cookie es inválida/expirada, retornar null sin crash
    console.error("Error verifying session cookie:", error);
    return null;
  }
}

