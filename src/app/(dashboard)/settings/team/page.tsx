"use client";

import { Loader2 } from "lucide-react";
import { useWorkspaces } from "@/hooks/useWorkspace";
import { TeamSettings } from "@/components/workspace";

export default function TeamSettingsPage() {
  const { currentWorkspaceId, isLoading } = useWorkspaces();

  if (isLoading || !currentWorkspaceId) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-muted-foreground">
          Manage your team members and invitations.
        </p>
      </div>

      <TeamSettings workspaceId={currentWorkspaceId} />
    </div>
  );
}
