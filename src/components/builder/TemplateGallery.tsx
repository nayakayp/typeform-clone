"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Grid,
  Layout,
  Loader2,
  Search,
  Star,
  Users,
  FileText,
  ClipboardList,
  MessageSquare,
  HelpCircle,
  Calendar,
  Briefcase,
  ShoppingCart,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { TEMPLATE_CATEGORIES, TemplateCategory } from "@/lib/db/schema";

interface Template {
  id: string;
  name: string;
  description?: string;
  category?: TemplateCategory;
  isFeatured: boolean;
  usageCount: number;
  snapshot: {
    title: string;
    questions: Array<{ title: string; type: string }>;
  };
  createdByUser?: {
    name?: string;
  };
}

const categoryIcons: Record<TemplateCategory, React.ReactNode> = {
  surveys: <ClipboardList className="h-4 w-4" />,
  feedback: <MessageSquare className="h-4 w-4" />,
  registration: <Users className="h-4 w-4" />,
  quizzes: <HelpCircle className="h-4 w-4" />,
  contact: <FileText className="h-4 w-4" />,
  applications: <Briefcase className="h-4 w-4" />,
  events: <Calendar className="h-4 w-4" />,
  research: <Target className="h-4 w-4" />,
  orders: <ShoppingCart className="h-4 w-4" />,
  leads: <Users className="h-4 w-4" />,
};

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

async function fetchTemplates(params?: {
  category?: string;
  search?: string;
  featured?: boolean;
}) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.featured) searchParams.set("featured", "true");
  searchParams.set("categoryCounts", "true");

  const response = await fetch(`/api/templates?${searchParams.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch templates");
  return response.json();
}

async function createFormFromTemplate(templateId: string, workspaceId: string) {
  const response = await fetch(`/api/templates/${templateId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspaceId }),
  });
  if (!response.ok) throw new Error("Failed to create form");
  return response.json();
}

function TemplateCard({
  template,
  onSelect,
  onPreview,
}: {
  template: Template;
  onSelect: () => void;
  onPreview: () => void;
}) {
  return (
    <Card className="group cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2" onClick={onPreview}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate flex items-center gap-2">
              {template.isFeatured && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
              {template.name}
            </CardTitle>
            {template.category && (
              <Badge variant="secondary" className="mt-1">
                {categoryLabels[template.category]}
              </Badge>
            )}
          </div>
        </div>
        {template.description && (
          <CardDescription className="line-clamp-2 mt-2">
            {template.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent onClick={onPreview}>
        <div className="text-sm text-muted-foreground mb-4">
          {template.snapshot.questions.length} questions
          {template.usageCount > 0 && (
            <>
              <span className="mx-2">•</span>
              Used {template.usageCount} times
            </>
          )}
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="w-full"
          size="sm"
        >
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
}

function TemplatePreviewDialog({
  template,
  open,
  onOpenChange,
  onUse,
}: {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: () => void;
}) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template.isFeatured && (
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            )}
            {template.name}
          </DialogTitle>
          {template.description && (
            <DialogDescription>{template.description}</DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {template.category && (
                <Badge variant="outline">
                  {categoryIcons[template.category]}
                  <span className="ml-1">{categoryLabels[template.category]}</span>
                </Badge>
              )}
              <span>{template.snapshot.questions.length} questions</span>
              {template.usageCount > 0 && (
                <span>• Used {template.usageCount} times</span>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-3">Questions</h4>
              <div className="space-y-2">
                {template.snapshot.questions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <span className="text-muted-foreground text-sm w-6">
                      {i + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{q.title}</p>
                      <p className="text-xs text-muted-foreground">{q.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onUse}>Use This Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TemplateGalleryProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateGallery({
  workspaceId,
  open,
  onOpenChange,
}: TemplateGalleryProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["templates", category, search],
    queryFn: () =>
      fetchTemplates({
        category: category !== "all" ? category : undefined,
        search: search || undefined,
      }),
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (templateId: string) =>
      createFormFromTemplate(templateId, workspaceId),
    onSuccess: (data) => {
      toast.success("Form created from template");
      onOpenChange(false);
      router.push(`/forms/${data.formId}/edit`);
    },
    onError: () => {
      toast.error("Failed to create form from template");
    },
  });

  const templates: Template[] = data?.templates || [];
  const categoryCounts = data?.categories || [];

  const handleUseTemplate = (templateId: string) => {
    createMutation.mutate(templateId);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Template Gallery
            </DialogTitle>
            <DialogDescription>
              Start with a pre-built template and customize it to your needs
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 py-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={category} onValueChange={setCategory} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="flex-wrap h-auto justify-start gap-1 bg-transparent p-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All
              </TabsTrigger>
              {TEMPLATE_CATEGORIES.map((cat) => {
                const count = categoryCounts.find(
                  (c: { category: string; count: number }) => c.category === cat
                )?.count;
                return (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {categoryIcons[cat]}
                    <span className="ml-1">{categoryLabels[cat]}</span>
                    {count ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({count})
                      </span>
                    ) : null}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Grid className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No templates found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                  {templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={() => handleUseTemplate(template.id)}
                      onPreview={() => setPreviewTemplate(template)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      <TemplatePreviewDialog
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        onUse={() => {
          if (previewTemplate) {
            handleUseTemplate(previewTemplate.id);
          }
        }}
      />
    </>
  );
}
