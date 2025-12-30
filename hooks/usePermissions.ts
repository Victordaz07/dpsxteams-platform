"use client";

import { useState, useEffect } from "react";
import type { Permission } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/roles";

interface PermissionsResponse {
  role: Role | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

/**
 * Hook to get current user's permissions
 * Fetches role and permissions from server
 */
export function usePermissions(): PermissionsResponse {
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/permissions")
      .then((res) => res.json())
      .then((data) => {
        if (data.role) {
          setRole(data.role);
          setPermissions(data.permissions || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching permissions:", err);
        setLoading(false);
      });
  }, []);

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    return perms.some((perm) => permissions.includes(perm));
  };

  const hasAllPermissions = (perms: Permission[]): boolean => {
    return perms.every((perm) => permissions.includes(perm));
  };

  return {
    role,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}

