import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrganizations } from "@/lib/db/organizations";

/**
 * GET /api/auth/organizations
 * 
 * Returns all organizations for the current user
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

    const organizations = await getUserOrganizations(user.uid);

    if (!organizations) {
      return NextResponse.json({
        organizations: [],
      });
    }

    return NextResponse.json({
      organizations,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

