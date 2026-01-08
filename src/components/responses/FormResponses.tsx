"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  MessageSquare,
  Eye,
  Trash2,
  MoreHorizontal,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Globe,
  Calendar,
  FileText,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Response {
  id: string;
  formId: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  email: string | null;
  ipAddress: string | null;
  answers: Array<{
    questionId: string;
    textValue: string | null;
    numberValue: string | null;
    questionTitle: string | null;
    questionType: string | null;
  }>;
}

interface FormResponsesProps {
  formId: string;
}

export function FormResponses({ formId }: FormResponsesProps) {
  const queryClient = useQueryClient();
  const [deleteResponseId, setDeleteResponseId] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

  const { data: responsesData, isLoading } = useQuery({
    queryKey: ["responses", formId],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${formId}/responses`);
      if (!res.ok) throw new Error("Failed to fetch responses");
      return res.json();
    },
  });

  const responses: Response[] = responsesData?.responses ?? [];

  const deleteResponseMutation = useMutation({
    mutationFn: async (responseId: string) => {
      const res = await fetch(`/api/forms/${formId}/responses/${responseId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete response");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses", formId] });
      toast.success("Response deleted");
      setDeleteResponseId(null);
    },
    onError: () => {
      toast.error("Failed to delete response");
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="gap-1.5 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-500 border-emerald-500/30 shadow-sm shadow-emerald-500/10">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Complete
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30 shadow-sm shadow-amber-500/10">
            <Clock className="h-3.5 w-3.5" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="gap-1.5 bg-gradient-to-r from-slate-500/20 to-slate-600/20 text-slate-400 border-slate-500/30">
            <XCircle className="h-3.5 w-3.5" />
            Partial
          </Badge>
        );
    }
  };

  // Calculate stats
  const completedCount = responses.filter(r => r.status === "completed").length;
  const inProgressCount = responses.filter(r => r.status === "in_progress").length;
  const completionRate = responses.length > 0 ? Math.round((completedCount / responses.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-white/5 to-transparent p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-6 ring-8 ring-primary/5 backdrop-blur-sm">
            <MessageSquare className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            No responses yet
          </h3>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            Share your form to start collecting responses. They&apos;ll appear here
            as they come in with real-time updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Premium Glassmorphism Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Responses */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-6 backdrop-blur-sm transition-all hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 p-3 ring-4 ring-violet-500/10">
                <FileText className="h-5 w-5 text-violet-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-violet-400/80">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>All time</span>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-violet-300 to-purple-400 bg-clip-text text-transparent">
              {responses.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Total Responses</p>
          </div>
        </div>

        {/* Completed */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-3 ring-4 ring-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <Sparkles className="h-4 w-4 text-emerald-400/50" />
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
              {completedCount}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Completed</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-6 backdrop-blur-sm transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-3 ring-4 ring-amber-500/10">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              {inProgressCount}
            </p>
            <p className="text-sm text-muted-foreground mt-1">In Progress</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent p-6 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-3 ring-4 ring-cyan-500/10">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              {completionRate}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">Completion Rate</p>
          </div>
        </div>
      </div>

      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">All Responses</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click on a response to view details
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all" 
          asChild
        >
          <a href={`/api/forms/${formId}/responses/export?format=csv`} download>
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </Button>
      </div>

      {/* Responses Table - Premium Design */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10 bg-white/5 hover:bg-white/5">
              <TableHead className="font-semibold text-white/80">Respondent</TableHead>
              <TableHead className="font-semibold text-white/80">Status</TableHead>
              <TableHead className="font-semibold text-white/80">Submitted</TableHead>
              <TableHead className="font-semibold text-white/80 text-center">Answers</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response, index) => (
              <TableRow 
                key={response.id}
                className="group cursor-pointer border-b border-white/5 transition-all hover:bg-white/5"
                onClick={() => setSelectedResponse(response)}
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-semibold text-sm ring-2 ring-primary/20">
                        {response.email ? response.email[0].toUpperCase() : "A"}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                    </div>
                    <div>
                      <div className="font-medium text-white group-hover:text-primary transition-colors flex items-center gap-2">
                        {response.email || "Anonymous"}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Globe className="h-3 w-3" />
                        {response.ipAddress || "Unknown IP"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(response.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground/60" />
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(response.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-white/10 to-white/5 px-3 py-1 text-sm font-medium ring-1 ring-white/10">
                    {response.answers?.length || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 border-white/10 bg-background/95 backdrop-blur-xl">
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResponse(response);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteResponseId(response.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteResponseId}
        onOpenChange={() => setDeleteResponseId(null)}
      >
        <AlertDialogContent className="border-white/10 bg-background/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Response</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this response? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteResponseId && deleteResponseMutation.mutate(deleteResponseId)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Response Details Dialog - Premium Design */}
      <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-white/10 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-bold text-lg ring-4 ring-primary/10">
                  {selectedResponse?.email ? selectedResponse.email[0].toUpperCase() : "A"}
                </div>
              </div>
              <div>
                <span className="text-xl">Response Details</span>
                <p className="text-sm font-normal text-muted-foreground mt-1">
                  {selectedResponse?.email || "Anonymous Respondent"}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-6 mt-6">
              {/* Respondent Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <User className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider font-medium">Respondent</span>
                  </div>
                  <p className="font-semibold text-white">{selectedResponse.email || "Anonymous"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider font-medium">IP Address</span>
                  </div>
                  <p className="font-semibold text-white">{selectedResponse.ipAddress || "Unknown"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider font-medium">Submitted</span>
                  </div>
                  <p className="font-semibold text-white">
                    {format(new Date(selectedResponse.createdAt), "PPpp")}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider font-medium">Status</span>
                  </div>
                  <div className="mt-1">{getStatusBadge(selectedResponse.status)}</div>
                </div>
              </div>

              {/* Answers Section */}
              <div>
                <h4 className="font-bold mb-4 flex items-center gap-2 text-lg">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  Answers
                  <span className="text-sm font-normal text-muted-foreground">
                    ({selectedResponse.answers.length})
                  </span>
                </h4>
                {selectedResponse.answers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
                    <p className="text-muted-foreground">No answers recorded</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedResponse.answers.map((answer, index) => (
                      <div 
                        key={answer.questionId} 
                        className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 transition-all hover:border-primary/30 hover:bg-white/[0.07]"
                      >
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-white/10 text-xs font-medium">
                            {index + 1}
                          </span>
                          {answer.questionTitle || `Question ${index + 1}`}
                        </p>
                        <p className="font-medium text-white text-lg">
                          {answer.textValue || answer.numberValue || (
                            <span className="text-muted-foreground italic">No answer provided</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
