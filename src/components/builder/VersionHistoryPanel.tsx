"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  Clock,
  History,
  Loader2,
  RotateCcw,
  Tag,
  Eye,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface FormVersion {
  id: string;
  version: number;
  changeDescription?: string;
  label?: string;
  createdAt: string;
  createdByUser?: {
    id: string;
    name?: string;
    email: string;
  };
  snapshot: {
    title: string;
    questions: Array<{ title: string }>;
  };
}

interface VersionHistoryPanelProps {
  formId: string;
}

async function fetchVersions(formId: string) {
  const response = await fetch(`/api/forms/${formId}/versions`);
  if (!response.ok) throw new Error("Failed to fetch versions");
  return response.json();
}

async function restoreVersion(formId: string, versionId: string) {
  const response = await fetch(
    `/api/forms/${formId}/versions/${versionId}/restore`,
    { method: "POST" }
  );
  if (!response.ok) throw new Error("Failed to restore version");
  return response.json();
}

async function updateVersionLabel(
  formId: string,
  versionId: string,
  label: string
) {
  const response = await fetch(`/api/forms/${formId}/versions/${versionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });
  if (!response.ok) throw new Error("Failed to update label");
  return response.json();
}

async function saveVersion(formId: string, description?: string) {
  const response = await fetch(`/api/forms/${formId}/versions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });
  if (!response.ok) throw new Error("Failed to save version");
  return response.json();
}

function VersionItem({
  version,
  isCurrent,
  onPreview,
  onRestore,
  onLabelEdit,
}: {
  version: FormVersion;
  isCurrent: boolean;
  onPreview: () => void;
  onRestore: () => void;
  onLabelEdit: (label: string) => void;
}) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(version.label || "");

  const handleLabelSave = () => {
    onLabelEdit(labelValue);
    setIsEditingLabel(false);
  };

  return (
    <div className="group p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">Version {version.version}</span>
            {isCurrent && (
              <Badge variant="secondary" className="text-xs">
                Current
              </Badge>
            )}
            {version.label && !isEditingLabel && (
              <Badge
                variant="outline"
                className="text-xs cursor-pointer"
                onClick={() => setIsEditingLabel(true)}
              >
                <Tag className="h-3 w-3 mr-1" />
                {version.label}
              </Badge>
            )}
            {isEditingLabel && (
              <div className="flex items-center gap-1">
                <Input
                  value={labelValue}
                  onChange={(e) => setLabelValue(e.target.value)}
                  className="h-6 w-24 text-xs"
                  placeholder="Label"
                  onBlur={handleLabelSave}
                  onKeyDown={(e) => e.key === "Enter" && handleLabelSave()}
                  autoFocus
                />
              </div>
            )}
          </div>

          {version.changeDescription && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {version.changeDescription}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(version.createdAt), {
                addSuffix: true,
              })}
            </span>
            {version.createdByUser && (
              <>
                <span>•</span>
                <span>{version.createdByUser.name || version.createdByUser.email}</span>
              </>
            )}
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            {version.snapshot.questions.length} question(s)
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4" />
          </Button>
          {!isCurrent && (
            <Button variant="ghost" size="sm" onClick={onRestore}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function VersionPreviewDialog({
  version,
  open,
  onOpenChange,
}: {
  version: FormVersion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!version) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Version {version.version} Preview</DialogTitle>
          <DialogDescription>
            {version.changeDescription || `Saved ${format(new Date(version.createdAt), "PPpp")}`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Form Title</h4>
              <p className="text-muted-foreground">{version.snapshot.title}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">
                Questions ({version.snapshot.questions.length})
              </h4>
              <div className="space-y-2">
                {version.snapshot.questions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 bg-muted rounded"
                  >
                    <span className="text-muted-foreground text-sm w-6">
                      {i + 1}.
                    </span>
                    <span className="text-sm">{q.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function VersionHistoryPanel({ formId }: VersionHistoryPanelProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<FormVersion | null>(null);
  const [restoreDialogVersion, setRestoreDialogVersion] = useState<FormVersion | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["versions", formId],
    queryFn: () => fetchVersions(formId),
    enabled: isOpen,
  });

  const restoreMutation = useMutation({
    mutationFn: (versionId: string) => restoreVersion(formId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["versions", formId] });
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
      toast.success("Form restored to previous version");
      setRestoreDialogVersion(null);
    },
    onError: () => {
      toast.error("Failed to restore version");
    },
  });

  const saveMutation = useMutation({
    mutationFn: (description?: string) => saveVersion(formId, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["versions", formId] });
      toast.success("Version saved");
    },
    onError: () => {
      toast.error("Failed to save version");
    },
  });

  const labelMutation = useMutation({
    mutationFn: ({ versionId, label }: { versionId: string; label: string }) =>
      updateVersionLabel(formId, versionId, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["versions", formId] });
    },
  });

  const versions: FormVersion[] = data?.versions || [];

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[480px]">
          <SheetHeader className="space-y-4">
            <SheetTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </SheetTitle>
            <Button
              onClick={() => saveMutation.mutate("Manual save")}
              disabled={saveMutation.isPending}
              size="sm"
              className="w-full"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Current Version
            </Button>
          </SheetHeader>

          <Separator className="my-4" />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No versions saved yet</p>
              <p className="text-sm mt-1">
                Save a version to track changes over time
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-3 pr-4">
                {versions.map((version, index) => (
                  <VersionItem
                    key={version.id}
                    version={version}
                    isCurrent={index === 0}
                    onPreview={() => setPreviewVersion(version)}
                    onRestore={() => setRestoreDialogVersion(version)}
                    onLabelEdit={(label) =>
                      labelMutation.mutate({ versionId: version.id, label })
                    }
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      <VersionPreviewDialog
        version={previewVersion}
        open={!!previewVersion}
        onOpenChange={(open) => !open && setPreviewVersion(null)}
      />

      <Dialog
        open={!!restoreDialogVersion}
        onOpenChange={(open) => !open && setRestoreDialogVersion(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore to Version {restoreDialogVersion?.version}?</DialogTitle>
            <DialogDescription>
              This will save your current form as a new version, then restore to the
              selected version. You can always restore back if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreDialogVersion(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                restoreDialogVersion &&
                restoreMutation.mutate(restoreDialogVersion.id)
              }
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
