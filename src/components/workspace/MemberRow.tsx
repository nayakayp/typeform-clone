"use client";

import { useState } from "react";
import { MoreHorizontal, Shield, User, Eye, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWorkspaceMembers, usePermission, useWorkspace } from "@/hooks/useWorkspace";
import { canManageRole, getAssignableRoles } from "@/lib/permissions";
import type { WorkspaceRole } from "@/lib/db/schema";

interface MemberRowProps {
  member: {
    id: string;
    userId: string;
    role: string;
    joinedAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  };
  workspaceId: string;
}

const roleIcons: Record<WorkspaceRole, React.ReactNode> = {
  owner: <Shield className="h-3 w-3" />,
  admin: <Shield className="h-3 w-3" />,
  member: <User className="h-3 w-3" />,
  viewer: <Eye className="h-3 w-3" />,
};

const roleLabels: Record<WorkspaceRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

const roleBadgeVariants: Record<WorkspaceRole, "default" | "secondary" | "outline"> = {
  owner: "default",
  admin: "secondary",
  member: "outline",
  viewer: "outline",
};

export function MemberRow({ member, workspaceId }: MemberRowProps) {
  const { currentMember } = useWorkspace(workspaceId);
  const { updateMemberRole, removeMember, isUpdatingRole, isRemoving } = useWorkspaceMembers(workspaceId);
  const canManageRoles = usePermission("team:manage-roles");
  const canRemoveMembers = usePermission("team:remove");
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const memberRole = member.role as WorkspaceRole;
  const currentUserRole = currentMember?.role as WorkspaceRole;

  const canEditThisMember =
    canManageRoles &&
    memberRole !== "owner" &&
    currentUserRole &&
    canManageRole(currentUserRole, memberRole);

  const canRemoveThisMember =
    canRemoveMembers &&
    memberRole !== "owner" &&
    currentUserRole &&
    canManageRole(currentUserRole, memberRole);

  const assignableRoles = currentUserRole ? getAssignableRoles(currentUserRole) : [];

  const handleRoleChange = async (newRole: WorkspaceRole) => {
    try {
      await updateMemberRole({ memberId: member.id, role: newRole });
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleRemove = async () => {
    try {
      await removeMember(member.id);
      setConfirmRemoveOpen(false);
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.user.image || undefined} />
            <AvatarFallback>
              {(member.user.name || member.user.email).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{member.user.name || member.user.email}</p>
            <p className="text-sm text-muted-foreground">{member.user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={roleBadgeVariants[memberRole]} className="gap-1">
            {roleIcons[memberRole]}
            {roleLabels[memberRole]}
          </Badge>

          {(canEditThisMember || canRemoveThisMember) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEditThisMember &&
                  assignableRoles.map((role) => (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      disabled={isUpdatingRole}
                    >
                      {roleIcons[role]}
                      <span className="ml-2">Change to {roleLabels[role]}</span>
                    </DropdownMenuItem>
                  ))}

                {canEditThisMember && canRemoveThisMember && (
                  <DropdownMenuSeparator />
                )}

                {canRemoveThisMember && (
                  <DropdownMenuItem
                    onClick={() => setConfirmRemoveOpen(true)}
                    className="text-destructive focus:text-destructive"
                    disabled={isRemoving}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="ml-2">Remove from workspace</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {member.user.name || member.user.email}{" "}
              from this workspace? They will lose access to all forms and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
