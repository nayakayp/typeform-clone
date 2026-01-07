"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useWorkspace, useWorkspaces, usePermission } from "@/hooks/useWorkspace";
import { useRouter } from "next/navigation";

const workspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const { currentWorkspaceId } = useWorkspaces();
  const {
    workspace,
    currentMember,
    updateWorkspace,
    deleteWorkspace,
    isUpdating,
    isDeleting,
    isLoading,
  } = useWorkspace();

  const canEdit = usePermission("settings:edit");
  const isOwner = currentMember?.role === "owner";

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    values: workspace
      ? { name: workspace.name, slug: workspace.slug }
      : undefined,
  });

  if (isLoading || !workspace) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onSubmit = async (data: WorkspaceFormData) => {
    try {
      setError(null);
      setSuccess(false);
      await updateWorkspace(data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update workspace");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWorkspace();
      router.push("/forms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete workspace");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workspace Settings</h1>
        <p className="text-muted-foreground">
          Manage your workspace settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Basic information about your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={workspace.logo || undefined} />
                <AvatarFallback className="text-xl">
                  {workspace.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {canEdit && (
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload logo
                  </Button>
                  {workspace.logo && (
                    <Button type="button" variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input
                id="name"
                {...register("name")}
                disabled={!canEdit}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Workspace URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  app.example.com/
                </span>
                <Input
                  id="slug"
                  {...register("slug")}
                  disabled={!canEdit}
                  className="flex-1"
                />
              </div>
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && (
              <p className="text-sm text-green-600">Settings saved successfully</p>
            )}

            {canEdit && (
              <Button type="submit" disabled={isUpdating || !isDirty}>
                {isUpdating ? "Saving..." : "Save changes"}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Workspace Settings</CardTitle>
            <CardDescription>
              Configure workspace behavior and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allow member invites</p>
                <p className="text-sm text-muted-foreground">
                  Let team members invite others to this workspace.
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require approval</p>
                <p className="text-sm text-muted-foreground">
                  Require admin approval for new member requests.
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      )}

      {isOwner && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your entire workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Transfer ownership</p>
                <p className="text-sm text-muted-foreground">
                  Transfer this workspace to another team member.
                </p>
              </div>
              <Button variant="outline">Transfer</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete workspace</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this workspace and all its data.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete workspace</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the workspace "{workspace.name}" and all associated forms,
                      responses, and team members.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete workspace"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
