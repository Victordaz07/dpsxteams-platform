import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { supabaseService } from "@/lib/supabase/service";

/**
 * POST /api/auth/bootstrap
 *
 * Creates or updates user record in app.users after first login.
 * Optionally creates default organization and membership if user has none.
 */
export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Upsert user in app.users
    const { data: appUser, error: userError } = await supabaseService
      .from("users")
      .upsert(
        {
          firebase_uid: user.uid,
          email: user.email || null,
          name: (user as any).name || null,
          status: "active",
        },
        { onConflict: "firebase_uid" }
      )
      .select()
      .single();

    if (userError) {
      console.error("Error upserting user:", userError);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Check if user has any organizations
    const { data: memberships, error: membershipError } = await supabaseService
      .from("memberships")
      .select("organization_id")
      .eq("user_id", appUser.id)
      .eq("status", "active");

    if (membershipError) {
      console.error("Error checking memberships:", membershipError);
      return NextResponse.json({ error: "Failed to check memberships" }, { status: 500 });
    }

    let hasOrganizations = !!(memberships && memberships.length > 0);

    // If no organizations, create default
    if (!hasOrganizations) {
      const { data: org, error: orgError } = await supabaseService
        .from("organizations")
        .insert({
          name: `${user.email || user.uid}'s Organization`,
          slug: `org-${user.uid.substring(0, 8)}`,
          status: "active",
        })
        .select()
        .single();

      if (orgError) {
        console.error("Error creating default organization:", orgError);
        return NextResponse.json(
          { error: "Failed to create default organization" },
          { status: 500 }
        );
      }

      const { error: membershipCreateError } = await supabaseService
        .from("memberships")
        .insert({
          user_id: appUser.id,
          organization_id: org.id,
          role: "OPS",
          status: "active",
        });

      if (membershipCreateError) {
        console.error("Error creating membership:", membershipCreateError);
        return NextResponse.json(
          { error: "Failed to create membership" },
          { status: 500 }
        );
      }

      hasOrganizations = true;
    }

    return NextResponse.json({
      user_id: appUser.id,
      has_organizations: hasOrganizations,
    });
  } catch (error) {
    console.error("Error in bootstrap:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

