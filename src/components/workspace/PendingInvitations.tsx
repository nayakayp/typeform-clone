"use client";

import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Mail, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceInvitations } from "@/hooks/useWorkspace";
import type { WorkspaceRole } from "@/lib/db/schema";

interface PendingInvitationsProps {
  workspaceId: string;
}

const roleLabels: Record<WorkspaceRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export function PendingInvitations({ workspaceId }: PendingInvitationsProps) {
  const {
    invitations,
    resendInvitation,
    cancelInvitation,
    isResending,
    isCancelling,
    isLoading,
  } = useWorkspaceInvitations(workspaceId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const pendingInvitations = invitations.filter(
    (inv) => new Date(inv.expiresAt) > new Date()
  );

  if (pendingInvitations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No pending invitations
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {pendingInvitations.map((invitation) => {
        const isExpired = new Date(invitation.expiresAt) < new Date();

        return (
          <div
            key={invitation.id}
            className="flex items-center justify-between py-3 px-4 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{invitation.email}</p>
                <p className="text-sm text-muted-foreground">
                  Invited {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                  {isExpired && " (expired)"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {roleLabels[invitation.role as WorkspaceRole]}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => resendInvitation(invitation.id)}
                    disabled={isResending}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Resend invitation
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => cancelInvitation(invitation.id)}
                    disabled={isCancelling}
                    className="text-destructive focus:text-destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel invitation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
