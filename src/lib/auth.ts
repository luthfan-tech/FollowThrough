/**
 * FollowThrough Identity & Permissions Module
 *
 * Configured for single-user individual mode: all operations are permitted
 * without authentication or role-based authorization barriers.
 */

export type UserRole = "ADMIN" | "APPROVER" | "MEMBER" | "AUDITOR";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarInitials: string;
}

export const INDIVIDUAL_USER: UserProfile = {
  id: "usr-me",
  name: "Workspace Owner",
  email: "user@followthrough.ai",
  role: "ADMIN",
  title: "Individual User",
  avatarInitials: "FT",
};

export const DEFAULT_USER = INDIVIDUAL_USER;

export const PRESET_USERS: Record<string, UserProfile> = {
  me: INDIVIDUAL_USER,
};

/**
 * Individual user mode: all permissions are unconditionally granted.
 */
export function canUserPerform(_role?: string, _permission?: string): boolean {
  return true;
}

/**
 * Authenticates requests in zero-friction individual user mode.
 */
export function authenticateRequest(_request?: Request): {
  authenticated: boolean;
  user: UserProfile;
} {
  return { authenticated: true, user: INDIVIDUAL_USER };
}
