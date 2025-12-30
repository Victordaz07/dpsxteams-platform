"use client";

import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/auth/permissions";
import type { ReactNode } from "react";

interface ProtectedNavProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on permissions
 */
export function ProtectedNav({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: ProtectedNavProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // No permission check, always show
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

