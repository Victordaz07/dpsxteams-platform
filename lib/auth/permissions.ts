import type { Role } from "./roles";

/**
 * Permission definitions
 * Each permission represents a capability or action
 */
export type Permission =
  | "drivers.view"
  | "drivers.create"
  | "drivers.update"
  | "drivers.delete"
  | "vehicles.view"
  | "vehicles.create"
  | "vehicles.update"
  | "vehicles.delete"
  | "routes.view"
  | "routes.create"
  | "routes.update"
  | "routes.delete"
  | "dispatch.view"
  | "dispatch.assign"
  | "dispatch.manage"
  | "reports.view"
  | "reports.export"
  | "settings.view"
  | "settings.update"
  | "users.view"
  | "users.invite"
  | "users.manage"
  | "finance.view"
  | "finance.manage"
  | "safety.view"
  | "safety.manage"
  | "tracking.view"
  | "tracking.manage";

/**
 * Role-Permission matrix
 * Maps each role to its allowed permissions
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // OPS: Full operational access
  OPS: [
    "drivers.view",
    "drivers.create",
    "drivers.update",
    "drivers.delete",
    "vehicles.view",
    "vehicles.create",
    "vehicles.update",
    "vehicles.delete",
    "routes.view",
    "routes.create",
    "routes.update",
    "routes.delete",
    "dispatch.view",
    "dispatch.assign",
    "dispatch.manage",
    "reports.view",
    "reports.export",
    "settings.view",
    "settings.update",
    "users.view",
    "users.invite",
    "users.manage",
    "finance.view",
    "safety.view",
    "safety.manage",
    "tracking.view",
    "tracking.manage",
  ],

  // DISPATCH: Dispatch and route management
  DISPATCH: [
    "drivers.view",
    "vehicles.view",
    "routes.view",
    "routes.create",
    "routes.update",
    "dispatch.view",
    "dispatch.assign",
    "dispatch.manage",
    "reports.view",
    "tracking.view",
    "tracking.manage",
  ],

  // HR: Human resources management
  HR: [
    "drivers.view",
    "drivers.create",
    "drivers.update",
    "users.view",
    "users.invite",
    "users.manage",
    "reports.view",
  ],

  // SAFETY: Safety management
  SAFETY: [
    "drivers.view",
    "vehicles.view",
    "routes.view",
    "safety.view",
    "safety.manage",
    "reports.view",
    "reports.export",
    "tracking.view",
  ],

  // FINANCE: Financial management
  FINANCE: [
    "drivers.view",
    "routes.view",
    "finance.view",
    "finance.manage",
    "reports.view",
    "reports.export",
  ],

  // DRIVER: Limited access, own data only
  DRIVER: [
    "drivers.view", // Own profile only (enforced by RLS)
    "routes.view", // Assigned routes only (enforced by RLS)
    "tracking.view", // Own tracking only (enforced by RLS)
  ],

  // PLATFORM_OWNER: Full platform access
  PLATFORM_OWNER: [
    "drivers.view",
    "drivers.create",
    "drivers.update",
    "drivers.delete",
    "vehicles.view",
    "vehicles.create",
    "vehicles.update",
    "vehicles.delete",
    "routes.view",
    "routes.create",
    "routes.update",
    "routes.delete",
    "dispatch.view",
    "dispatch.assign",
    "dispatch.manage",
    "reports.view",
    "reports.export",
    "settings.view",
    "settings.update",
    "users.view",
    "users.invite",
    "users.manage",
    "finance.view",
    "finance.manage",
    "safety.view",
    "safety.manage",
    "tracking.view",
    "tracking.manage",
  ],

  // PLATFORM_ADMIN: Platform administration
  PLATFORM_ADMIN: [
    "drivers.view",
    "drivers.create",
    "drivers.update",
    "vehicles.view",
    "vehicles.create",
    "vehicles.update",
    "routes.view",
    "routes.create",
    "routes.update",
    "dispatch.view",
    "dispatch.assign",
    "reports.view",
    "reports.export",
    "settings.view",
    "users.view",
    "users.invite",
    "users.manage",
    "tracking.view",
    "tracking.manage",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.some((perm) => hasPermission(role, perm));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.every((perm) => hasPermission(role, perm));
}

