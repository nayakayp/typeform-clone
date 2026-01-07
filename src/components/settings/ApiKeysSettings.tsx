"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// API Key types
interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  suffix: string;
  permissions: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface CreateApiKeyResponse {
  apiKey: ApiKey;
  plainTextKey: string;
}

// Available permissions
const AVAILABLE_PERMISSIONS = [
  { value: "*", label: "Full Access", description: "All permissions" },
  { value: "forms:read", label: "Read Forms", description: "View forms" },
  { value: "forms:write", label: "Write Forms", description: "Create/update forms" },
  { value: "forms:delete", label: "Delete Forms", description: "Delete forms" },
  { value: "questions:read", label: "Read Questions", description: "View questions" },
  { value: "questions:write", label: "Write Questions", description: "Create/update questions" },
  { value: "responses:read", label: "Read Responses", description: "View responses" },
  { value: "responses:delete", label: "Delete Responses", description: "Delete responses" },
  { value: "webhooks:read", label: "Read Webhooks", description: "View webhooks" },
  { value: "webhooks:write", label: "Write Webhooks", description: "Create/update webhooks" },
];

// API functions
async function fetchApiKeys(): Promise<ApiKey[]> {
  const response = await fetch("/api/settings/api-keys");
  if (!response.ok) throw new Error("Failed to fetch API keys");
  const data = await response.json();
  return data.keys;
}

async function createApiKey(data: {
  name: string;
  permissions: string[];
}): Promise<CreateApiKeyResponse> {
  const response = await fetch("/api/settings/api-keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create API key");
  return response.json();
}

async function revokeApiKey(id: string): Promise<void> {
  const response = await fetch(`/api/settings/api-keys/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to revoke API key");
}

export function ApiKeysSettings() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [keyName, setKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["*"]);

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: fetchApiKeys,
  });

  const createMutation = useMutation({
    mutationFn: createApiKey,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setShowCreateDialog(false);
      setNewKey(data.plainTextKey);
      setShowNewKeyDialog(true);
      setKeyName("");
      setSelectedPermissions(["*"]);
      toast.success("API key created successfully");
    },
    onError: () => {
      toast.error("Failed to create API key");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setKeyToRevoke(null);
      toast.success("API key revoked successfully");
    },
    onError: () => {
      toast.error("Failed to revoke API key");
    },
  });

  const handleCreate = () => {
    if (!keyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }
    createMutation.mutate({
      name: keyName.trim(),
      permissions: selectedPermissions,
    });
  };

  const handleCopyKey = async () => {
    if (newKey) {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const togglePermission = (permission: string) => {
    if (permission === "*") {
      setSelectedPermissions(["*"]);
    } else {
      const filtered = selectedPermissions.filter((p) => p !== "*");
      if (filtered.includes(permission)) {
        setSelectedPermissions(filtered.filter((p) => p !== permission));
      } else {
        setSelectedPermissions([...filtered, permission]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage API keys for programmatic access to your workspace
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading API keys...
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No API keys yet. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {key.prefix}...{key.suffix}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {key.permissions.includes("*")
                          ? "Full Access"
                          : `${key.permissions.length} permissions`}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {key.lastUsedAt
                        ? formatDistanceToNow(new Date(key.lastUsedAt), {
                            addSuffix: true,
                          })
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(key.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setKeyToRevoke(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for programmatic access to your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., Production API Key"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <div
                    key={perm.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={perm.value}
                      checked={selectedPermissions.includes(perm.value)}
                      onCheckedChange={() => togglePermission(perm.value)}
                    />
                    <label
                      htmlFor={perm.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {perm.label}
                      <span className="text-muted-foreground ml-2">
                        ({perm.description})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Key Display Dialog */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Save Your API Key
            </DialogTitle>
            <DialogDescription>
              This is the only time you will see this API key. Make sure to copy
              it and store it securely.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative">
              <Input
                readOnly
                value={newKey || ""}
                className="pr-20 font-mono text-sm"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={handleCopyKey}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Use this key in your API requests with the Authorization header:
            </p>
            <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-x-auto">
              {`Authorization: Bearer ${newKey?.slice(0, 20)}...`}
            </pre>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowNewKeyDialog(false)}>
              I've saved my key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog
        open={!!keyToRevoke}
        onOpenChange={() => setKeyToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this API key? Any applications
              using this key will immediately lose access. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => keyToRevoke && revokeMutation.mutate(keyToRevoke)}
            >
              {revokeMutation.isPending ? "Revoking..." : "Revoke Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
