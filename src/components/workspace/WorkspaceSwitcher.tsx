"use client";

import { useState } from "react";
import { Check, ChevronDown, Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspaces } from "@/hooks/useWorkspace";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";

export function WorkspaceSwitcher() {
  const router = useRouter();
  const { workspaces, currentWorkspace, switchWorkspace, isLoading } = useWorkspaces();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <Button variant="ghost" className="w-full justify-start" disabled>
        <div className="h-6 w-6 animate-pulse rounded-full bg-muted mr-2" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </Button>
    );
  }

  if (!currentWorkspace) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => setCreateDialogOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create workspace
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={currentWorkspace.logo || undefined} />
              <AvatarFallback className="text-xs">
                {currentWorkspace.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 text-left truncate">{currentWorkspace.name}</span>
            <ChevronDown className="h-4 w-4 ml-auto opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="start">
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => switchWorkspace(workspace.id)}
              className="flex items-center"
            >
              <Avatar className="h-5 w-5 mr-2">
                <AvatarImage src={workspace.logo || undefined} />
                <AvatarFallback className="text-xs">
                  {workspace.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{workspace.name}</span>
              {workspace.id === currentWorkspace.id && (
                <Check className="h-4 w-4 ml-auto" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => router.push("/settings/workspace")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Workspace settings
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
