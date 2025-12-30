/**
 * Role definitions for the XTG SaaS Platform
 * 
 * DSP Roles (app-level):
 * - OPS: Operations manager
 * - DISPATCH: Dispatch coordinator
 * - HR: Human resources
 * - SAFETY: Safety officer
 * - FINANCE: Finance manager
 * - DRIVER: Driver (limited access)
 * 
 * Platform Roles (platform-level):
 * - PLATFORM_OWNER: Platform owner (SaaS provider)
 * - PLATFORM_ADMIN: Platform administrator
 */

export const DSP_ROLES = [
  "OPS",
  "DISPATCH",
  "HR",
  "SAFETY",
  "FINANCE",
  "DRIVER",
] as const;

export const PLATFORM_ROLES = [
  "PLATFORM_OWNER",
  "PLATFORM_ADMIN",
] as const;

export type DSPRole = (typeof DSP_ROLES)[number];
export type PlatformRole = (typeof PLATFORM_ROLES)[number];
export type Role = DSPRole | PlatformRole;

/**
 * Check if a role is a DSP role
 */
export function isDSPRole(role: string): role is DSPRole {
  return DSP_ROLES.includes(role as DSPRole);
}

/**
 * Check if a role is a Platform role
 */
export function isPlatformRole(role: string): role is PlatformRole {
  return PLATFORM_ROLES.includes(role as PlatformRole);
}

/**
 * Validate role string
 */
export function isValidRole(role: string): role is Role {
  return isDSPRole(role) || isPlatformRole(role);
}

