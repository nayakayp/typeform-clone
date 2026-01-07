"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
  WorkspaceRole,
} from "@/lib/db/schema";
import {
  hasPermission,
  memberHasPermission,
  type Permission,
} from "@/lib/permissions";
import { useAuth } from "./use-auth";

// API response types
interface WorkspaceWithMember extends Workspace {
  currentMember: WorkspaceMember | null;
}

interface WorkspaceMemberWithUser extends WorkspaceMember {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

// Local storage key for current workspace
const CURRENT_WORKSPACE_KEY = "currentWorkspaceId";

function getStoredWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_WORKSPACE_KEY);
}

function setStoredWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_WORKSPACE_KEY, workspaceId);
}

/**
 * Hook for managing workspaces
 */
export function useWorkspaces() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Fetch all workspaces the user is a member of
  const {
    data: workspaces = [],
    isLoading,
    error,
  } = useQuery<WorkspaceWithMember[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await fetch("/api/workspaces");
      if (!response.ok) {
        throw new Error("Failed to fetch workspaces");
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Get current workspace ID from storage or first workspace
  const currentWorkspaceId = useMemo(() => {
    const storedId = getStoredWorkspaceId();
    if (storedId && workspaces.some((w) => w.id === storedId)) {
      return storedId;
    }
    return workspaces[0]?.id ?? null;
  }, [workspaces]);

  // Current workspace data
  const currentWorkspace = useMemo(() => {
    return workspaces.find((w) => w.id === currentWorkspaceId) ?? null;
  }, [workspaces, currentWorkspaceId]);

  // Switch to a different workspace
  const switchWorkspace = useCallback((workspaceId: string) => {
    setStoredWorkspaceId(workspaceId);
    // Invalidate queries that depend on current workspace
    queryClient.invalidateQueries({ queryKey: ["forms"] });
    queryClient.invalidateQueries({ queryKey: ["responses"] });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  }, [queryClient]);

  // Create workspace mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create workspace");
      }
      return response.json();
    },
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      switchWorkspace(newWorkspace.id);
    },
  });

  return {
    workspaces,
    currentWorkspace,
    currentWorkspaceId,
    switchWorkspace,
    createWorkspace: createWorkspaceMutation.mutateAsync,
    isCreating: createWorkspaceMutation.isPending,
    isLoading,
    error,
  };
}

/**
 * Hook for managing a single workspace
 */
export function useWorkspace(workspaceId?: string) {
  const queryClient = useQueryClient();
  const { currentWorkspaceId } = useWorkspaces();
  const id = workspaceId ?? currentWorkspaceId;

  // Fetch workspace details
  const {
    data: workspace,
    isLoading,
    error,
  } = useQuery<WorkspaceWithMember>({
    queryKey: ["workspace", id],
    queryFn: async () => {
      const response = await fetch(`/api/workspaces/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch workspace");
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Update workspace mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: async (data: Partial<Workspace>) => {
      const response = await fetch(`/api/workspaces/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update workspace");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", id] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  // Delete workspace mutation
  const deleteWorkspaceMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/workspaces/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete workspace");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  // Transfer ownership mutation
  const transferOwnershipMutation = useMutation({
    mutationFn: async (newOwnerId: string) => {
      const response = await fetch(`/api/workspaces/${id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOwnerId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to transfer ownership");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", id] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-members", id] });
    },
  });

  return {
    workspace,
    currentMember: workspace?.currentMember ?? null,
    updateWorkspace: updateWorkspaceMutation.mutateAsync,
    deleteWorkspace: deleteWorkspaceMutation.mutateAsync,
    transferOwnership: transferOwnershipMutation.mutateAsync,
    isUpdating: updateWorkspaceMutation.isPending,
    isDeleting: deleteWorkspaceMutation.isPending,
    isTransferring: transferOwnershipMutation.isPending,
    isLoading,
    error,
  };
}

/**
 * Hook for managing workspace members
 */
export function useWorkspaceMembers(workspaceId?: string) {
  const queryClient = useQueryClient();
  const { currentWorkspaceId } = useWorkspaces();
  const id = workspaceId ?? currentWorkspaceId;

  // Fetch members
  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery<WorkspaceMemberWithUser[]>({
    queryKey: ["workspace-members", id],
    queryFn: async () => {
      const response = await fetch(`/api/workspaces/${id}/members`);
      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: WorkspaceRole;
    }) => {
      const response = await fetch(`/api/workspaces/${id}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update member role");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", id] });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`/api/workspaces/${id}/members/${memberId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove member");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", id] });
    },
  });

  return {
    members,
    updateMemberRole: updateRoleMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    isUpdatingRole: updateRoleMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
    isLoading,
    error,
  };
}

/**
 * Hook for managing workspace invitations
 */
export function useWorkspaceInvitations(workspaceId?: string) {
  const queryClient = useQueryClient();
  const { currentWorkspaceId } = useWorkspaces();
  const id = workspaceId ?? currentWorkspaceId;

  // Fetch invitations
  const {
    data: invitations = [],
    isLoading,
    error,
  } = useQuery<WorkspaceInvitation[]>({
    queryKey: ["workspace-invitations", id],
    queryFn: async () => {
      const response = await fetch(`/api/workspaces/${id}/invitations`);
      if (!response.ok) {
        throw new Error("Failed to fetch invitations");
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async ({
      email,
      role,
    }: {
      email: string;
      role: WorkspaceRole;
    }) => {
      const response = await fetch(`/api/workspaces/${id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send invitation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-invitations", id] });
    },
  });

  // Bulk invite mutation
  const bulkInviteMutation = useMutation({
    mutationFn: async (
      invites: Array<{ email: string; role: WorkspaceRole }>
    ) => {
      const response = await fetch(`/api/workspaces/${id}/invitations/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invites }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send invitations");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-invitations", id] });
    },
  });

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetch(
        `/api/workspaces/${id}/invitations/${invitationId}/resend`,
        { method: "POST" }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to resend invitation");
      }
      return response.json();
    },
  });

  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetch(
        `/api/workspaces/${id}/invitations/${invitationId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel invitation");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-invitations", id] });
    },
  });

  return {
    invitations,
    invite: createInvitationMutation.mutateAsync,
    bulkInvite: bulkInviteMutation.mutateAsync,
    resendInvitation: resendInvitationMutation.mutateAsync,
    cancelInvitation: cancelInvitationMutation.mutateAsync,
    isInviting: createInvitationMutation.isPending,
    isBulkInviting: bulkInviteMutation.isPending,
    isResending: resendInvitationMutation.isPending,
    isCancelling: cancelInvitationMutation.isPending,
    isLoading,
    error,
  };
}

/**
 * Hook for checking permissions
 */
export function usePermission(permission: Permission): boolean {
  const { currentWorkspace } = useWorkspaces();
  const member = currentWorkspace?.currentMember;

  if (!member) return false;
  return memberHasPermission(member, permission);
}

/**
 * Hook for checking multiple permissions
 */
export function usePermissions(permissions: Permission[]): Record<Permission, boolean> {
  const { currentWorkspace } = useWorkspaces();
  const member = currentWorkspace?.currentMember;

  return useMemo(() => {
    const result = {} as Record<Permission, boolean>;
    for (const permission of permissions) {
      result[permission] = member ? memberHasPermission(member, permission) : false;
    }
    return result;
  }, [member, permissions]);
}
