import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { getServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

/**
 * POST /api/auth/select-org
 * 
 * Validates that user has active membership for the selected organization,
 * then sets active_org_id cookie.
 * 
 * Security: Always validates membership server-side before setting cookie.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { organization_id } = body;

    if (!organization_id || typeof organization_id !== "string") {
      return NextResponse.json(
        { error: "organization_id is required" },
        { status: 400 }
      );
    }

    // Verify user has active membership for this organization
    const { client } = await getServerClient();

    // Get user's app.users record
    const { data: appUser, error: userError } = await client
      .from("users")
      .select("id")
      .eq("firebase_uid", user.uid)
      .single();

    if (userError || !appUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify membership exists and is active
    const { data: membership, error: membershipError } = await client
      .from("memberships")
      .select("id, organization_id, status")
      .eq("user_id", appUser.id)
      .eq("organization_id", organization_id)
      .eq("status", "active")
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: "You don't have access to this organization" },
        { status: 403 }
      );
    }

    // Set active_org_id cookie (httpOnly, secure)
    const cookieStore = await cookies();
    cookieStore.set("active_org_id", organization_id, {
      httpOnly: true,
      secure: env.AUTH_COOKIE_SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error selecting organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

