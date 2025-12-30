import { NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/auth/rbac";
import { getRolePermissions } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/roles";

/**
 * GET /api/auth/permissions
 * 
 * Returns current user's role and permissions
 */
export async function GET() {
  try {
    const role = await getCurrentUserRole();

    if (!role) {
      return NextResponse.json({
        role: null,
        permissions: [],
      });
    }

    const permissions = getRolePermissions(role);

    return NextResponse.json({
      role,
      permissions,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

