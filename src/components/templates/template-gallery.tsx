"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, FileText, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { TEMPLATE_CATEGORIES, TemplateCategory, FormSnapshot } from "@/lib/db/schema";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: TemplateCategory | null;
  thumbnail: string | null;
  isPublic: boolean;
  isFeatured: boolean;
  snapshot: FormSnapshot;
  usageCount: number;
  createdBy: string | null;
  createdAt: string;
  createdByUser: {
    id: string;
    name: string | null;
  } | null;
}

interface TemplateCardProps {
  template: Template;
  featured?: boolean;
  onPreview: (template: Template) => void;
  onUse: (template: Template) => void;
}

export function TemplateCard({ template, featured, onPreview, onUse }: TemplateCardProps) {
  return (
    <Card className={`relative ${featured ? "border-primary" : ""}`}>
      {featured && (
        <Badge className="absolute top-3 right-3 z-10" variant="default">
          <Star className="h-3 w-3 mr-1" />
          Featured
        </Badge>
      )}

      <div className="h-40 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
        <FileText className="h-12 w-12 text-muted-foreground/50" />
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-1">{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {template.description || "No description"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex gap-2 flex-wrap">
          {template.category && (
            <Badge variant="outline" className="capitalize">
              {template.category}
            </Badge>
          )}
          <Badge variant="secondary">
            {template.snapshot.questions?.length || 0} questions
          </Badge>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {template.usageCount} uses
          </span>
          {template.createdByUser?.name && (
            <span>by {template.createdByUser.name}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onPreview(template)}>
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
        <Button size="sm" className="flex-1" onClick={() => onUse(template)}>
          Use
        </Button>
      </CardFooter>
    </Card>
  );
}

interface TemplatePreviewDialogProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: (template: Template) => void;
}

export function TemplatePreviewDialog({ template, open, onOpenChange, onUse }: TemplatePreviewDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Form Preview */}
            <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
              <h4 className="font-medium text-sm">Form Preview</h4>
              <div className="space-y-3">
                <div className="text-center py-4 border-b">
                  <h3 className="font-semibold">{template.snapshot.title}</h3>
                  {template.snapshot.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.snapshot.description}
                    </p>
                  )}
                </div>
                {template.snapshot.questions?.slice(0, 5).map((q, i) => (
                  <div key={q.id} className="text-sm p-2 bg-background rounded">
                    <span className="text-muted-foreground mr-2">{i + 1}.</span>
                    <span>{q.title}</span>
                    {q.required && <span className="text-destructive ml-1">*</span>}
                  </div>
                ))}
                {(template.snapshot.questions?.length || 0) > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{(template.snapshot.questions?.length || 0) - 5} more questions
                  </p>
                )}
              </div>
            </div>

            {/* Template Info */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Questions ({template.snapshot.questions?.length || 0})</h4>
                <ul className="space-y-1 text-sm text-muted-foreground max-h-48 overflow-y-auto">
                  {template.snapshot.questions?.map((q, i) => (
                    <li key={q.id} className="flex items-center gap-2">
                      <span className="font-mono text-xs">{i + 1}.</span>
                      <span className="truncate flex-1">{q.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {q.type}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Details</h4>
                <dl className="text-sm space-y-1">
                  {template.category && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="capitalize">{template.category}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Used</dt>
                    <dd>{template.usageCount} times</dd>
                  </div>
                  {template.createdByUser?.name && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Created by</dt>
                      <dd>{template.createdByUser.name}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onUse(template)}>
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UseTemplateDialogProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UseTemplateDialog({ template, open, onOpenChange }: UseTemplateDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");

  const { data: workspacesData } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      if (!res.ok) throw new Error("Failed to fetch workspaces");
      return res.json();
    },
    enabled: open,
  });

  const createFormMutation = useMutation({
    mutationFn: async () => {
      if (!template || !selectedWorkspace) return;
      const res = await fetch(`/api/templates/${template.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: selectedWorkspace }),
      });
      if (!res.ok) throw new Error("Failed to create form");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form created from template");
      onOpenChange(false);
      router.push(`/forms/${data.formId}/edit`);
    },
    onError: () => {
      toast.error("Failed to create form from template");
    },
  });

  const workspaces = workspacesData?.workspaces || [];

  // Auto-select first workspace if only one
  if (workspaces.length === 1 && !selectedWorkspace) {
    setSelectedWorkspace(workspaces[0].id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use Template</DialogTitle>
          <DialogDescription>
            Select a workspace to create your new form in.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
            <SelectTrigger>
              <SelectValue placeholder="Select workspace" />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((workspace: { id: string; name: string }) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createFormMutation.mutate()}
            disabled={!selectedWorkspace || createFormMutation.isPending}
          >
            {createFormMutation.isPending ? "Creating..." : "Create Form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TemplateGalleryProps {
  workspaceId?: string;
}

export function TemplateGallery({ workspaceId }: TemplateGalleryProps) {
  const [category, setCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [useTemplate, setUseTemplate] = useState<Template | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["templates", category, workspaceId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (workspaceId) params.set("workspaceId", workspaceId);
      params.set("categoryCounts", "true");

      const res = await fetch(`/api/templates?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const { data: featuredData } = useQuery({
    queryKey: ["templates", "featured"],
    queryFn: async () => {
      const res = await fetch("/api/templates?featured=true&limit=4");
      if (!res.ok) throw new Error("Failed to fetch featured templates");
      return res.json();
    },
  });

  const templates: Template[] = data?.templates || [];
  const featuredTemplates: Template[] = featuredData?.templates || [];
  const categoryCounts = data?.categories || [];

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleUse = (template: Template) => {
    setPreviewTemplate(null);
    setUseTemplate(template);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Templates */}
      {featuredTemplates.length > 0 && category === "all" && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Featured Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                featured
                onPreview={handlePreview}
                onUse={handleUse}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={category === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setCategory("all")}
        >
          All Templates
        </Button>
        {TEMPLATE_CATEGORIES.map((cat) => {
          const count = categoryCounts.find(
            (c: { category: string; count: number }) => c.category === cat
          )?.count || 0;
          return (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              className="capitalize"
            >
              {cat} {count > 0 && `(${count})`}
            </Button>
          );
        })}
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No templates found in this category
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={handlePreview}
              onUse={handleUse}
            />
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        onUse={handleUse}
      />

      {/* Use Template Dialog */}
      <UseTemplateDialog
        template={useTemplate}
        open={!!useTemplate}
        onOpenChange={(open) => !open && setUseTemplate(null)}
      />
    </div>
  );
}
