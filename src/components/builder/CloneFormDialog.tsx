"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
}

interface CloneFormDialogProps {
  formId: string;
  formTitle: string;
  currentWorkspaceId: string;
  children: React.ReactNode;
}

async function fetchWorkspaces() {
  const response = await fetch("/api/workspaces");
  if (!response.ok) throw new Error("Failed to fetch workspaces");
  return response.json();
}

async function cloneForm(
  formId: string,
  options: {
    workspaceId?: string;
    newTitle?: string;
    includeTheme?: boolean;
  }
) {
  const response = await fetch(`/api/forms/${formId}/clone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });
  if (!response.ok) throw new Error("Failed to clone form");
  return response.json();
}

export function CloneFormDialog({
  formId,
  formTitle,
  currentWorkspaceId,
  children,
}: CloneFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(`${formTitle} (Copy)`);
  const [workspaceId, setWorkspaceId] = useState(currentWorkspaceId);
  const [includeTheme, setIncludeTheme] = useState(true);

  const { data: workspacesData } = useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
    enabled: open,
  });

  const cloneMutation = useMutation({
    mutationFn: () =>
      cloneForm(formId, {
        workspaceId: workspaceId !== currentWorkspaceId ? workspaceId : undefined,
        newTitle,
        includeTheme,
      }),
    onSuccess: (data) => {
      toast.success("Form cloned successfully");
      setOpen(false);
      router.push(`/forms/${data.formId}/edit`);
    },
    onError: () => {
      toast.error("Failed to clone form");
    },
  });

  const workspaces: Workspace[] = workspacesData?.workspaces || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Clone Form
          </DialogTitle>
          <DialogDescription>
            Create a copy of this form with all its questions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Form Title</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter form title"
            />
          </div>

          {workspaces.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="workspace">Destination Workspace</Label>
              <Select value={workspaceId} onValueChange={setWorkspaceId}>
                <SelectTrigger id="workspace">
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.name}
                      {ws.id === currentWorkspaceId && " (Current)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="theme">Include Theme</Label>
            <Switch
              id="theme"
              checked={includeTheme}
              onCheckedChange={setIncludeTheme}
            />
          </div>

          <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">What will be cloned:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All questions and their settings</li>
              <li>Form description and settings</li>
              {includeTheme && <li>Theme customization</li>}
            </ul>
            <p className="mt-2 font-medium text-foreground">What won&apos;t be cloned:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Responses and analytics data</li>
              <li>Published status (starts as draft)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => cloneMutation.mutate()}
            disabled={!newTitle.trim() || cloneMutation.isPending}
          >
            {cloneMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Clone Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
