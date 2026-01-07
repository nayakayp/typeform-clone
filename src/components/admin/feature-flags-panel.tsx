"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Settings2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rolloutPercentage: number;
  targetUsers: string[] | null;
  targetWorkspaces: string[] | null;
  createdAt: string;
  updatedAt: string;
}

interface FeatureFlagsPanelProps {
  isSuper: boolean;
}

export function FeatureFlagsPanel({ isSuper }: FeatureFlagsPanelProps) {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [newFlag, setNewFlag] = useState({
    name: "",
    description: "",
    enabled: false,
    rolloutPercentage: 100,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-feature-flags"],
    queryFn: async () => {
      const res = await fetch("/api/admin/feature-flags");
      if (!res.ok) throw new Error("Failed to fetch feature flags");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newFlag) => {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create feature flag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] });
      toast.success("Feature flag created");
      setCreateDialogOpen(false);
      setNewFlag({ name: "", description: "", enabled: false, rolloutPercentage: 100 });
    },
    onError: () => {
      toast.error("Failed to create feature flag");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const res = await fetch(`/api/admin/feature-flags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle feature flag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] });
    },
    onError: () => {
      toast.error("Failed to toggle feature flag");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FeatureFlag> }) => {
      const res = await fetch(`/api/admin/feature-flags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update feature flag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] });
      toast.success("Feature flag updated");
      setEditDialogOpen(false);
      setSelectedFlag(null);
    },
    onError: () => {
      toast.error("Failed to update feature flag");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/feature-flags/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete feature flag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feature-flags"] });
      toast.success("Feature flag deleted");
      setDeleteDialogOpen(false);
      setSelectedFlag(null);
    },
    onError: () => {
      toast.error("Failed to delete feature flag");
    },
  });

  const flags: FeatureFlag[] = data?.flags || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Flag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
              <DialogDescription>
                Create a new feature flag to control feature rollouts.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newFlag.name}
                  onChange={(e) =>
                    setNewFlag((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="my_feature_flag"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newFlag.description}
                  onChange={(e) =>
                    setNewFlag((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="What does this feature flag control?"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Enabled</Label>
                <Switch
                  id="enabled"
                  checked={newFlag.enabled}
                  onCheckedChange={(checked) =>
                    setNewFlag((f) => ({ ...f, enabled: checked }))
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Rollout Percentage</Label>
                  <span className="text-sm text-muted-foreground">
                    {newFlag.rolloutPercentage}%
                  </span>
                </div>
                <Slider
                  value={[newFlag.rolloutPercentage]}
                  onValueChange={([value]) =>
                    setNewFlag((f) => ({ ...f, rolloutPercentage: value }))
                  }
                  max={100}
                  step={1}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(newFlag)}
                disabled={!newFlag.name || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {flags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No feature flags yet</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first flag
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <Card key={flag.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-mono">
                        {flag.name}
                      </CardTitle>
                      <Badge variant={flag.enabled ? "default" : "secondary"}>
                        {flag.enabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {flag.description || "No description"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: flag.id, enabled: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedFlag(flag);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    {isSuper && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedFlag(flag);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div>
                    Rollout: <span className="font-medium">{flag.rolloutPercentage}%</span>
                  </div>
                  {flag.targetUsers && flag.targetUsers.length > 0 && (
                    <div>
                      Target users: <span className="font-medium">{flag.targetUsers.length}</span>
                    </div>
                  )}
                  {flag.targetWorkspaces && flag.targetWorkspaces.length > 0 && (
                    <div>
                      Target workspaces: <span className="font-medium">{flag.targetWorkspaces.length}</span>
                    </div>
                  )}
                  <div>
                    Updated{" "}
                    {formatDistanceToNow(new Date(flag.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Feature Flag</DialogTitle>
            <DialogDescription>
              Update the feature flag settings.
            </DialogDescription>
          </DialogHeader>
          {selectedFlag && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedFlag.description || ""}
                  onChange={(e) =>
                    setSelectedFlag((f) =>
                      f ? { ...f, description: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Rollout Percentage</Label>
                  <span className="text-sm text-muted-foreground">
                    {selectedFlag.rolloutPercentage}%
                  </span>
                </div>
                <Slider
                  value={[selectedFlag.rolloutPercentage]}
                  onValueChange={([value]) =>
                    setSelectedFlag((f) =>
                      f ? { ...f, rolloutPercentage: value } : null
                    )
                  }
                  max={100}
                  step={1}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedFlag &&
                updateMutation.mutate({
                  id: selectedFlag.id,
                  data: {
                    description: selectedFlag.description,
                    rolloutPercentage: selectedFlag.rolloutPercentage,
                  },
                })
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feature Flag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the feature flag &quot;{selectedFlag?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedFlag && deleteMutation.mutate(selectedFlag.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
