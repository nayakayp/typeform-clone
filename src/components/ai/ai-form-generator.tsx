"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface GeneratedQuestion {
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: Array<{ value: string }>;
}

interface GeneratedForm {
  title: string;
  description: string;
  questions: GeneratedQuestion[];
}

interface AIFormGeneratorProps {
  workspaceId: string;
  trigger?: React.ReactNode;
}

export function AIFormGenerator({ workspaceId, trigger }: AIFormGeneratorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"input" | "preview">("input");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [questionCount, setQuestionCount] = useState([8]);
  const [generatedForm, setGeneratedForm] = useState<GeneratedForm | null>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          purpose: purpose || undefined,
          tone: tone || undefined,
          questionCount: questionCount[0],
        }),
      });
      if (!res.ok) throw new Error("Failed to generate form");
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedForm(data.form);
      setStep("preview");
    },
    onError: () => {
      toast.error("Failed to generate form. Please try again.");
    },
  });

  const createFormMutation = useMutation({
    mutationFn: async (form: GeneratedForm) => {
      // Create form
      const formRes = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: form.title,
          description: form.description,
        }),
      });
      if (!formRes.ok) throw new Error("Failed to create form");
      const { form: createdForm } = await formRes.json();

      // Add questions
      for (let i = 0; i < form.questions.length; i++) {
        const q = form.questions[i];
        await fetch(`/api/forms/${createdForm.id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: q.type,
            title: q.title,
            description: q.description,
            required: q.required,
            order: i,
            options: q.options?.map((o, idx) => ({
              value: o.value,
              order: idx,
            })),
          }),
        });
      }

      return createdForm;
    },
    onSuccess: (form) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form created successfully!");
      setOpen(false);
      router.push(`/forms/${form.id}/edit`);
    },
    onError: () => {
      toast.error("Failed to create form");
    },
  });

  const handleReset = () => {
    setStep("input");
    setGeneratedForm(null);
  };

  const getQuestionTypeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      short_text: "Short Text",
      long_text: "Long Text",
      email: "Email",
      phone: "Phone",
      number: "Number",
      single_choice: "Single Choice",
      multiple_choice: "Multiple Choice",
      dropdown: "Dropdown",
      rating: "Rating",
      yes_no: "Yes/No",
      date: "Date",
      url: "URL",
    };
    return typeMap[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Sparkles className="h-4 w-4 mr-2" />
            Create with AI
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Form with AI
          </DialogTitle>
          <DialogDescription>
            Describe your form and let AI generate it for you
          </DialogDescription>
        </DialogHeader>

        {step === "input" ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                Describe your form <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="E.g., A customer feedback survey for an e-commerce store to understand shopping experience and product satisfaction..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Be specific about the purpose, target audience, and type of information you want to collect.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="survey">Survey</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="registration">Registration</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Number of Questions</Label>
                <span className="text-sm text-muted-foreground">
                  ~{questionCount[0]} questions
                </span>
              </div>
              <Slider
                value={questionCount}
                onValueChange={setQuestionCount}
                min={3}
                max={15}
                step={1}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={description.length < 10 || generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Form
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : generatedForm ? (
          <div className="space-y-6 py-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{generatedForm.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {generatedForm.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {generatedForm.questions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {i + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{q.title}</span>
                        {q.required && (
                          <span className="text-destructive text-xs">*</span>
                        )}
                      </div>
                      {q.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {q.description}
                        </p>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {getQuestionTypeBadge(q.type)}
                      </Badge>
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {q.options.slice(0, 4).map((o, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {o.value}
                            </Badge>
                          ))}
                          {q.options.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{q.options.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={() => createFormMutation.mutate(generatedForm)}
                disabled={createFormMutation.isPending}
              >
                {createFormMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Form
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
