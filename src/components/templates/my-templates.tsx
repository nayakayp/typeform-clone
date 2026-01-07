"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { MoreHorizontal, Trash2, Globe, Lock, Plus, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { TemplateCategory, FormSnapshot } from "@/lib/db/schema";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: TemplateCategory | null;
  isPublic: boolean;
  isFeatured: boolean;
  snapshot: FormSnapshot;
  usageCount: number;
  createdAt: string;
}

interface MyTemplatesProps {
  workspaceId?: string;
  onCreateNew?: () => void;
}

export function MyTemplates({ workspaceId, onCreateNew }: MyTemplatesProps) {
  const queryClient = useQueryClient();
  const [deleteTemplate, setDeleteTemplate] = useState<Template | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-templates", workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (workspaceId) params.set("workspaceId", workspaceId);
      params.set("mine", "true");

      const res = await fetch(`/api/templates?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-templates"] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template deleted");
      setDeleteTemplate(null);
    },
    onError: () => {
      toast.error("Failed to delete template");
    },
  });

  const togglePublicMutation = useMutation({
    mutationFn: async ({ templateId, isPublic }: { templateId: string; isPublic: boolean }) => {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });
      if (!res.ok) throw new Error("Failed to update template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-templates"] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template updated");
    },
    onError: () => {
      toast.error("Failed to update template");
    },
  });

  const templates: Template[] = data?.templates || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-medium mb-2">No templates yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Save your forms as templates to reuse them later
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{template.name}</div>
                    {template.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {template.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {template.category ? (
                    <Badge variant="outline" className="capitalize">
                      {template.category}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>{template.snapshot.questions?.length || 0}</TableCell>
                <TableCell>{template.usageCount}</TableCell>
                <TableCell>
                  <Badge variant={template.isPublic ? "default" : "secondary"}>
                    {template.isPublic ? (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          togglePublicMutation.mutate({
                            templateId: template.id,
                            isPublic: !template.isPublic,
                          })
                        }
                      >
                        {template.isPublic ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Make Private
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4 mr-2" />
                            Make Public
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteTemplate(template)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteTemplate}
        onOpenChange={(open) => !open && setDeleteTemplate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTemplate?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTemplate && deleteMutation.mutate(deleteTemplate.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
