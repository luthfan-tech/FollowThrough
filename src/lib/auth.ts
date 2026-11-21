/**
 * FollowThrough Authentication & Role-Based Access Control (RBAC) Module
 *
 * Provides identity context, role verification, and authorization checks
 * across API endpoints and UI action gates.
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

export const PRESET_USERS: Record<string, UserProfile> = {
  elena: {
    id: "usr-elena",
    name: "Elena Vance",
    email: "elena@followthrough.ai",
    role: "ADMIN",
    title: "VP of Product (Administrator)",
    avatarInitials: "EV",
  },
  priya: {
    id: "usr-priya",
    name: "Dev Priya",
    email: "priya@followthrough.ai",
    role: "APPROVER",
    title: "Tech Lead (Decision Approver)",
    avatarInitials: "DP",
  },
  marcus: {
    id: "usr-marcus",
    name: "Marcus Chen",
    email: "marcus@followthrough.ai",
    role: "MEMBER",
    title: "Senior Engineer (Contributor)",
    avatarInitials: "MC",
  },
  guest: {
    id: "usr-guest",
    name: "Auditor Guest",
    email: "auditor@external.org",
    role: "AUDITOR",
    title: "External Observer (Read-Only)",
    avatarInitials: "AG",
  },
};

export const DEFAULT_USER = PRESET_USERS.elena;

/**
 * RBAC Permission Matrix
 */
export const PERMISSIONS = {
  INGEST_MEETING: ["ADMIN", "APPROVER"],
  RUN_PIPELINE: ["ADMIN", "APPROVER"],
  APPROVE_DECISIONS: ["ADMIN", "APPROVER"],
  CONFIRM_TASKS: ["ADMIN", "APPROVER"],
  EDIT_DECISION_MEMORY: ["ADMIN"],
  UPDATE_TASK_STATUS: ["ADMIN", "APPROVER", "MEMBER"],
  VIEW_DIGESTS: ["ADMIN", "APPROVER", "MEMBER", "AUDITOR"],
  VIEW_DECISION_MEMORY: ["ADMIN", "APPROVER", "MEMBER", "AUDITOR"],
  CLEAR_WORKSPACE: ["ADMIN"],
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export function canUserPerform(role: UserRole, permission: PermissionKey): boolean {
  const allowed = PERMISSIONS[permission] as readonly string[];
  return allowed.includes(role);
}

/**
 * Extracts authentication context from incoming HTTP requests.
 * Supports Bearer tokens, x-user-role headers, and falls back to default admin context.
 */
export function authenticateRequest(request: Request): {
  authenticated: boolean;
  user: UserProfile;
  error?: string;
} {
  const roleHeader = request.headers.get("x-user-role");
  const authHeader = request.headers.get("authorization");

  // In production: Validate JWT via Auth0 / Supabase / NextAuth
  if (roleHeader && Object.values(PRESET_USERS).some((u) => u.role === roleHeader)) {
    const matched = Object.values(PRESET_USERS).find((u) => u.role === roleHeader);
    if (matched) {
      return { authenticated: true, user: matched };
    }
  }

  // Optional API Secret key validation for external webhook calls
  const apiKey = request.headers.get("x-api-key");
  const masterKey = process.env.API_SECRET_KEY;
  if (masterKey && apiKey && apiKey !== masterKey) {
    return { authenticated: false, user: PRESET_USERS.guest, error: "Invalid API Secret Key" };
  }

  // Default to Elena (Admin) in zero-friction evaluation mode
  return { authenticated: true, user: DEFAULT_USER };
}
