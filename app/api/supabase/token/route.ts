import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { signSupabaseJwt } from "@/lib/auth/supabase-jwt";

/**
 * GET /api/supabase/token
 * 
 * Returns a Supabase JWT token for the authenticated user.
 * This token is used by the browser client to make authenticated requests to Supabase.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Sign JWT with firebase_uid claim
    const access_token = signSupabaseJwt(user.uid);

    return NextResponse.json({
      access_token,
    });
  } catch (error) {
    console.error("Error generating Supabase token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

