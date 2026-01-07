"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspaceMembers, usePermission } from "@/hooks/useWorkspace";
import { MemberRow } from "./MemberRow";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { PendingInvitations } from "./PendingInvitations";

interface TeamSettingsProps {
  workspaceId: string;
}

export function TeamSettings({ workspaceId }: TeamSettingsProps) {
  const { members, isLoading } = useWorkspaceMembers(workspaceId);
  const canInvite = usePermission("team:invite");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          {canInvite && <InviteMemberDialog workspaceId={workspaceId} />}
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                workspaceId={workspaceId}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {canInvite && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <PendingInvitations workspaceId={workspaceId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
