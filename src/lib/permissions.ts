import type { WorkspaceRole, WorkspaceMember } from "./db/schema";

// Permission definitions
export const PERMISSIONS = {
  // Form permissions
  "forms:view": "View forms",
  "forms:create": "Create forms",
  "forms:edit": "Edit forms",
  "forms:delete": "Delete forms",
  "forms:publish": "Publish forms",

  // Response permissions
  "responses:view": "View responses",
  "responses:delete": "Delete responses",
  "responses:export": "Export responses",

  // Team permissions
  "team:view": "View team members",
  "team:invite": "Invite team members",
  "team:remove": "Remove team members",
  "team:manage-roles": "Manage member roles",

  // Settings permissions
  "settings:view": "View workspace settings",
  "settings:edit": "Edit workspace settings",

  // Analytics permissions
  "analytics:view": "View analytics",

  // Integration permissions
  "integrations:view": "View integrations",
  "integrations:manage": "Manage integrations",

  // Billing permissions
  "billing:view": "View billing",
  "billing:manage": "Manage billing",
} as const;

export type Permission = keyof typeof PERMISSIONS;

// Role-based permission mappings
const rolePermissions: Record<WorkspaceRole, Permission[] | "*"> = {
  owner: "*", // All permissions
  admin: [
    "forms:view",
    "forms:create",
    "forms:edit",
    "forms:delete",
    "forms:publish",
    "responses:view",
    "responses:delete",
    "responses:export",
    "team:view",
    "team:invite",
    "team:remove",
    "settings:view",
    "settings:edit",
    "analytics:view",
    "integrations:view",
    "integrations:manage",
  ],
  member: [
    "forms:view",
    "forms:create",
    "forms:edit",
    "forms:publish",
    "responses:view",
    "responses:export",
    "team:view",
    "analytics:view",
    "integrations:view",
  ],
  viewer: ["forms:view", "responses:view", "team:view", "analytics:view"],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: WorkspaceRole,
  permission: Permission
): boolean {
  const permissions = rolePermissions[role];
  if (permissions === "*") return true;
  return permissions.includes(permission);
}

/**
 * Check if a workspace member has a specific permission
 */
export function memberHasPermission(
  member: Pick<WorkspaceMember, "role">,
  permission: Permission
): boolean {
  return hasPermission(member.role as WorkspaceRole, permission);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: WorkspaceRole): Permission[] {
  const permissions = rolePermissions[role];
  if (permissions === "*") {
    return Object.keys(PERMISSIONS) as Permission[];
  }
  return permissions;
}

/**
 * Check if a role can manage another role (for role changes)
 */
export function canManageRole(
  managerRole: WorkspaceRole,
  targetRole: WorkspaceRole
): boolean {
  const roleHierarchy: Record<WorkspaceRole, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
  };

  // Only higher roles can manage lower roles
  // Owners can manage admins, members, viewers
  // Admins can manage members, viewers
  return roleHierarchy[managerRole] > roleHierarchy[targetRole];
}

/**
 * Get roles that a manager can assign
 */
export function getAssignableRoles(managerRole: WorkspaceRole): WorkspaceRole[] {
  const allRoles: WorkspaceRole[] = ["admin", "member", "viewer"];

  return allRoles.filter((role) => canManageRole(managerRole, role));
}

/**
 * Check if user is the workspace owner
 */
export function isWorkspaceOwner(
  member: Pick<WorkspaceMember, "role">
): boolean {
  return member.role === "owner";
}

/**
 * Check if user is at least an admin
 */
export function isWorkspaceAdmin(
  member: Pick<WorkspaceMember, "role">
): boolean {
  return member.role === "owner" || member.role === "admin";
}
