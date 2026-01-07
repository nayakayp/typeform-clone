"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
import { FormCard } from "./form-card";
import { Plus, Search, FileText } from "lucide-react";
import { toast } from "sonner";

interface Form {
  id: string;
  title: string;
  description: string | null;
  status: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    responses: number;
  };
}

export function FormsList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["forms", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/forms?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch forms");
      return res.json();
    },
  });

  const createFormMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Form",
        }),
      });
      if (!res.ok) throw new Error("Failed to create form");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      router.push(`/forms/${data.form.id}/edit`);
    },
    onError: () => {
      toast.error("Failed to create form");
    },
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (formId: string) => {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete form");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form deleted");
      setDeleteFormId(null);
    },
    onError: () => {
      toast.error("Failed to delete form");
    },
  });

  const duplicateFormMutation = useMutation({
    mutationFn: async (formId: string) => {
      const res = await fetch(`/api/forms/${formId}/clone`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to duplicate form");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form duplicated");
    },
    onError: () => {
      toast.error("Failed to duplicate form");
    },
  });

  const forms: Form[] = data?.forms ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All forms</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => createFormMutation.mutate()}
          disabled={createFormMutation.isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          {createFormMutation.isPending ? "Creating..." : "Create Form"}
        </Button>
      </div>

      {/* Forms Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first form to get started
          </p>
          <Button
            onClick={() => createFormMutation.mutate()}
            disabled={createFormMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onDelete={setDeleteFormId}
              onDuplicate={(id) => duplicateFormMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFormId} onOpenChange={() => setDeleteFormId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this form? This action cannot be undone.
              All responses will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFormId && deleteFormMutation.mutate(deleteFormId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteFormMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
