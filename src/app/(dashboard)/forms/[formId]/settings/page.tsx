"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Save,
  Settings,
  Eye,
  EyeOff,
  Calendar,
  Hash,
  Shuffle,
  FileText,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { FormSettings } from "@/lib/db/schema/forms";

interface FormData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  settings: FormSettings | null;
  maxResponses: number | null;
  closeAt: string | null;
  openAt: string | null;
}

const formSettingsSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  showProgressBar: z.boolean().optional(),
  showQuestionNumbers: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  oneQuestionPerPage: z.boolean().optional(),
  allowResponseEditing: z.boolean().optional(),
  closeAfterSubmission: z.boolean().optional(),
  responseLimitEnabled: z.boolean().optional(),
  responseLimit: z.number().min(1).optional(),
});

type FormSettingsFormData = z.infer<typeof formSettingsSchema>;

export default function FormSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const formId = params.formId as string;

  const [isSaving, setIsSaving] = useState(false);

  const { data: form, isLoading } = useQuery<FormData>({
    queryKey: ["form", formId],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${formId}`);
      if (!res.ok) throw new Error("Failed to fetch form");
      return res.json();
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormSettingsFormData>({
    resolver: zodResolver(formSettingsSchema),
    defaultValues: {
      title: "",
      description: "",
      showProgressBar: true,
      showQuestionNumbers: true,
      shuffleQuestions: false,
      oneQuestionPerPage: true,
      allowResponseEditing: false,
      closeAfterSubmission: false,
      responseLimitEnabled: false,
      responseLimit: 100,
    },
  });

  // Update form when data is fetched
  useEffect(() => {
    if (form) {
      reset({
        title: form.title || "",
        description: form.description || "",
        showProgressBar: form.settings?.showProgressBar ?? true,
        showQuestionNumbers: form.settings?.showQuestionNumbers ?? true,
        shuffleQuestions: form.settings?.shuffleQuestions ?? false,
        oneQuestionPerPage: form.settings?.oneQuestionPerPage ?? true,
        allowResponseEditing: form.settings?.allowResponseEditing ?? false,
        closeAfterSubmission: form.settings?.closeAfterSubmission ?? false,
        responseLimitEnabled: form.settings?.responseLimitEnabled ?? false,
        responseLimit: form.settings?.responseLimit ?? 100,
      });
    }
  }, [form, reset]);

  const updateFormMutation = useMutation({
    mutationFn: async (data: FormSettingsFormData) => {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || null,
          settings: {
            showProgressBar: data.showProgressBar,
            showQuestionNumbers: data.showQuestionNumbers,
            shuffleQuestions: data.shuffleQuestions,
            oneQuestionPerPage: data.oneQuestionPerPage,
            allowResponseEditing: data.allowResponseEditing,
            closeAfterSubmission: data.closeAfterSubmission,
            responseLimitEnabled: data.responseLimitEnabled,
            responseLimit: data.responseLimit,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to update form");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
      toast.success("Form settings saved successfully");
    },
    onError: () => {
      toast.error("Failed to save form settings");
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/forms/${formId}/publish`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish form");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
      toast.success("Form published successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/forms/${formId}/publish`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to unpublish form");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
      toast.success("Form unpublished successfully");
    },
    onError: () => {
      toast.error("Failed to unpublish form");
    },
  });

  const onSubmit = async (data: FormSettingsFormData) => {
    setIsSaving(true);
    try {
      await updateFormMutation.mutateAsync(data);
    } finally {
      setIsSaving(false);
    }
  };

  const watchResponseLimitEnabled = watch("responseLimitEnabled");

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Form not found</p>
        <Button variant="outline" asChild>
          <Link href="/forms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forms
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/forms/${formId}/edit`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Form Settings</h1>
            <p className="text-muted-foreground">
              Configure your form&apos;s behavior and appearance
            </p>
          </div>
        </div>
        <Badge variant={form.status === "published" ? "default" : "secondary"}>
          {form.status === "published" ? "Published" : "Draft"}
        </Badge>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Set your form&apos;s title and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Form Title</Label>
              <Input
                id="title"
                placeholder="Enter form title"
                {...register("title")}
                disabled={isSaving}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter form description (optional)"
                rows={3}
                {...register("description")}
                disabled={isSaving}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Publish Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {form.status === "published" ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
              Publish Status
            </CardTitle>
            <CardDescription>
              Control whether your form is accessible to respondents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <p className="font-medium">
                  {form.status === "published"
                    ? "Form is Published"
                    : "Form is in Draft"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {form.status === "published"
                    ? "Your form is live and accepting responses"
                    : "Your form is not visible to respondents"}
                </p>
              </div>
              <Button
                type="button"
                variant={form.status === "published" ? "outline" : "default"}
                onClick={() =>
                  form.status === "published"
                    ? unpublishMutation.mutate()
                    : publishMutation.mutate()
                }
                disabled={
                  publishMutation.isPending || unpublishMutation.isPending
                }
              >
                {(publishMutation.isPending || unpublishMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {form.status === "published" ? "Unpublish" : "Publish"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Display Settings
            </CardTitle>
            <CardDescription>
              Customize how your form appears to respondents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Show Progress Bar
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display a progress indicator for multi-page forms
                </p>
              </div>
              <Switch
                checked={watch("showProgressBar")}
                onCheckedChange={(checked) =>
                  setValue("showProgressBar", checked, { shouldDirty: true })
                }
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Show Question Numbers
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display numbers before each question
                </p>
              </div>
              <Switch
                checked={watch("showQuestionNumbers")}
                onCheckedChange={(checked) =>
                  setValue("showQuestionNumbers", checked, { shouldDirty: true })
                }
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Shuffle className="h-4 w-4" />
                  Shuffle Questions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Randomize the order of questions for each respondent
                </p>
              </div>
              <Switch
                checked={watch("shuffleQuestions")}
                onCheckedChange={(checked) =>
                  setValue("shuffleQuestions", checked, { shouldDirty: true })
                }
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>One Question Per Page</Label>
                <p className="text-sm text-muted-foreground">
                  Show only one question at a time (Typeform style)
                </p>
              </div>
              <Switch
                checked={watch("oneQuestionPerPage")}
                onCheckedChange={(checked) =>
                  setValue("oneQuestionPerPage", checked, { shouldDirty: true })
                }
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Response Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Response Settings
            </CardTitle>
            <CardDescription>
              Configure how responses are collected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Response Editing</Label>
                <p className="text-sm text-muted-foreground">
                  Let respondents edit their submitted responses
                </p>
              </div>
              <Switch
                checked={watch("allowResponseEditing")}
                onCheckedChange={(checked) =>
                  setValue("allowResponseEditing", checked, {
                    shouldDirty: true,
                  })
                }
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Close After Submission</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically close form after first submission
                </p>
              </div>
              <Switch
                checked={watch("closeAfterSubmission")}
                onCheckedChange={(checked) =>
                  setValue("closeAfterSubmission", checked, {
                    shouldDirty: true,
                  })
                }
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Limit Number of Responses</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically close form after reaching the limit
                  </p>
                </div>
                <Switch
                  checked={watch("responseLimitEnabled")}
                  onCheckedChange={(checked) =>
                    setValue("responseLimitEnabled", checked, {
                      shouldDirty: true,
                    })
                  }
                  disabled={isSaving}
                />
              </div>

              {watchResponseLimitEnabled && (
                <div className="ml-4 space-y-2">
                  <Label htmlFor="responseLimit">Maximum Responses</Label>
                  <Input
                    id="responseLimit"
                    type="number"
                    min={1}
                    className="w-32"
                    {...register("responseLimit")}
                    disabled={isSaving}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            asChild
            disabled={isSaving}
          >
            <Link href={`/forms/${formId}/edit`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving || !isDirty}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
