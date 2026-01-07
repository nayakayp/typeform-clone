"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, BookTemplate } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { TEMPLATE_CATEGORIES, TemplateCategory } from "@/lib/db/schema";

const categoryLabels: Record<TemplateCategory, string> = {
  surveys: "Surveys",
  feedback: "Feedback",
  registration: "Registration",
  quizzes: "Quizzes",
  contact: "Contact Forms",
  applications: "Applications",
  events: "Events",
  research: "Research",
  orders: "Orders",
  leads: "Lead Generation",
};

interface SaveAsTemplateDialogProps {
  formId: string;
  formTitle: string;
  workspaceId: string;
  children: React.ReactNode;
}

async function saveAsTemplate(
  formId: string,
  options: {
    name: string;
    description?: string;
    category?: TemplateCategory;
    isPublic?: boolean;
    workspaceId?: string;
  }
) {
  const response = await fetch("/api/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formId, ...options }),
  });
  if (!response.ok) throw new Error("Failed to save template");
  return response.json();
}

export function SaveAsTemplateDialog({
  formId,
  formTitle,
  workspaceId,
  children,
}: SaveAsTemplateDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(formTitle);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "">("");
  const [isPublic, setIsPublic] = useState(false);
  const [isWorkspaceTemplate, setIsWorkspaceTemplate] = useState(true);

  const saveMutation = useMutation({
    mutationFn: () =>
      saveAsTemplate(formId, {
        name,
        description: description || undefined,
        category: category || undefined,
        isPublic,
        workspaceId: isWorkspaceTemplate ? workspaceId : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Form saved as template");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to save template");
    },
  });

  const resetForm = () => {
    setName(formTitle);
    setDescription("");
    setCategory("");
    setIsPublic(false);
    setIsWorkspaceTemplate(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookTemplate className="h-5 w-5" />
            Save as Template
          </DialogTitle>
          <DialogDescription>
            Save this form as a reusable template for future forms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template is for"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as TemplateCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="workspace-template">Workspace Template</Label>
                <p className="text-sm text-muted-foreground">
                  Only visible to your workspace
                </p>
              </div>
              <Switch
                id="workspace-template"
                checked={isWorkspaceTemplate}
                onCheckedChange={setIsWorkspaceTemplate}
              />
            </div>

            {!isWorkspaceTemplate && (
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public">Public Template</Label>
                  <p className="text-sm text-muted-foreground">
                    Visible to all users
                  </p>
                </div>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!name.trim() || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
