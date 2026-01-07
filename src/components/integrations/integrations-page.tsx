"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Sheet,
  Table,
  Slack,
  Zap,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  ExternalLink,
  Plus,
  Check,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { INTEGRATION_PROVIDERS, IntegrationProvider } from "@/lib/db/schema";

interface Integration {
  id: string;
  provider: IntegrationProvider;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

interface FormIntegration {
  id: string;
  formId: string;
  integrationId: string;
  config: Record<string, unknown>;
  isActive: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
  createdAt: string;
  integration: Integration;
}

const integrationInfo: Record<IntegrationProvider, {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}> = {
  google_sheets: {
    name: "Google Sheets",
    icon: Sheet,
    description: "Sync responses to a spreadsheet",
    color: "bg-green-100 text-green-700",
  },
  slack: {
    name: "Slack",
    icon: Slack,
    description: "Get notified in Slack",
    color: "bg-purple-100 text-purple-700",
  },
  zapier: {
    name: "Zapier",
    icon: Zap,
    description: "Connect to 5000+ apps",
    color: "bg-orange-100 text-orange-700",
  },
  airtable: {
    name: "Airtable",
    icon: Table,
    description: "Sync to Airtable bases",
    color: "bg-blue-100 text-blue-700",
  },
  hubspot: {
    name: "HubSpot",
    icon: ExternalLink,
    description: "Create contacts and deals",
    color: "bg-orange-100 text-orange-700",
  },
  mailchimp: {
    name: "Mailchimp",
    icon: ExternalLink,
    description: "Add subscribers to lists",
    color: "bg-yellow-100 text-yellow-700",
  },
};

interface IntegrationsPageProps {
  formId: string;
}

export function IntegrationsPage({ formId }: IntegrationsPageProps) {
  const queryClient = useQueryClient();
  const [deleteIntegration, setDeleteIntegration] = useState<FormIntegration | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["form-integrations", formId],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${formId}/integrations`);
      if (!res.ok) throw new Error("Failed to fetch integrations");
      return res.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ integrationId, isActive }: { integrationId: string; isActive: boolean }) => {
      const res = await fetch(`/api/forms/${formId}/integrations/${integrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update integration");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-integrations", formId] });
    },
    onError: () => {
      toast.error("Failed to update integration");
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const res = await fetch(`/api/forms/${formId}/integrations/${integrationId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to sync");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-integrations", formId] });
      toast.success("Sync completed");
    },
    onError: () => {
      toast.error("Sync failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const res = await fetch(`/api/forms/${formId}/integrations/${integrationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-integrations", formId] });
      toast.success("Integration removed");
      setDeleteIntegration(null);
    },
    onError: () => {
      toast.error("Failed to remove integration");
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (provider: string) => {
      const res = await fetch(`/api/integrations/oauth/${provider}?formId=${formId}`);
      if (!res.ok) throw new Error("Failed to start OAuth");
      return res.json();
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => {
      toast.error("Failed to connect integration");
      setConnectingProvider(null);
    },
  });

  const handleConnect = (provider: string) => {
    setConnectingProvider(provider);
    connectMutation.mutate(provider);
  };

  const formIntegrations: FormIntegration[] = data?.integrations || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Integrations */}
      {formIntegrations.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Active Integrations</h3>
          <div className="space-y-4">
            {formIntegrations.map((fi) => {
              const info = integrationInfo[fi.integration.provider];
              const Icon = info.icon;

              return (
                <Card key={fi.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${info.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{info.name}</span>
                          {fi.isActive ? (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Paused</Badge>
                          )}
                          {fi.lastError && (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {fi.lastSyncAt
                            ? `Last synced ${formatDistanceToNow(new Date(fi.lastSyncAt), { addSuffix: true })}`
                            : "Not synced yet"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Switch
                        checked={fi.isActive}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ integrationId: fi.id, isActive: checked })
                        }
                      />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => syncMutation.mutate(fi.id)}
                            disabled={syncMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync Now
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteIntegration(fi)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Available Integrations */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Add Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATION_PROVIDERS.map((provider) => {
            const info = integrationInfo[provider];
            const Icon = info.icon;
            const isConnected = formIntegrations.some(
              (fi) => fi.integration.provider === provider
            );
            const isConnecting = connectingProvider === provider;

            return (
              <Card key={provider} className={isConnected ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${info.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{info.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {info.description}
                  </CardDescription>
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    disabled={isConnected || isConnecting}
                    onClick={() => handleConnect(provider)}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : isConnected ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Connected
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteIntegration}
        onOpenChange={(open) => !open && setDeleteIntegration(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Integration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this integration? This will stop all syncing
              and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteIntegration && deleteMutation.mutate(deleteIntegration.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
