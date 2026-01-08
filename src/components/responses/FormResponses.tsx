"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Complete
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="gap-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 dark:text-amber-400">
            <Clock className="h-3.5 w-3.5" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="gap-1.5 bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-slate-500/20 dark:text-slate-400">
            <XCircle className="h-3.5 w-3.5" />
            Partial
          </Badge>
        );
    }
  };

  // Calculate stats
  const completedCount = responses.filter(r => r.status === "completed").length;
  const inProgressCount = responses.filter(r => r.status === "in_progress").length;
  const partialCount = responses.length - completedCount - inProgressCount;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-gradient-to-br from-muted/30 to-muted/10">
        <CardContent className="flex flex-col items-center justify-center py-20">
          <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-5 mb-5 ring-8 ring-primary/5">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No responses yet</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Share your form to start collecting responses. They&apos;ll appear here
            as they come in.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2.5">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-500/5 to-transparent border-slate-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-500/10 p-2.5">
                <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{responses.length}</p>
                <p className="text-sm text-muted-foreground">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Export */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">All Responses</h2>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href={`/api/forms/${formId}/responses/export?format=csv`}>
            <Download className="h-4 w-4" />
            Export CSV
          </Link>
        </Button>
      </div>

      {/* Responses Table */}
      <Card className="overflow-hidden border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold">Respondent</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Submitted</TableHead>
              <TableHead className="font-semibold text-center">Answers</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response, index) => (
              <TableRow 
                key={response.id}
                className="group cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => setSelectedResponse(response)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-medium text-sm">
                      {response.email ? response.email[0].toUpperCase() : "A"}
                    </div>
                    <div>
                      <div className="font-medium group-hover:text-primary transition-colors">
                        {response.email || "Anonymous"}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {response.ipAddress || "Unknown IP"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(response.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(response.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium">
                    {response.answers?.length || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResponse(response);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteResponseId(response.id);
                        }}
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
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteResponseId}
        onOpenChange={() => setDeleteResponseId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Response</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this response? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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

      {/* Response Details Dialog */}
      <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-medium">
                {selectedResponse?.email ? selectedResponse.email[0].toUpperCase() : "A"}
              </div>
              <div>
                <span>Response Details</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  {selectedResponse?.email || "Anonymous Respondent"}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-6 mt-4">
              {/* Respondent Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wide">Respondent</span>
                  </div>
                  <p className="font-medium">{selectedResponse.email || "Anonymous"}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wide">IP Address</span>
                  </div>
                  <p className="font-medium">{selectedResponse.ipAddress || "Unknown"}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wide">Submitted</span>
                  </div>
                  <p className="font-medium">
                    {format(new Date(selectedResponse.createdAt), "PPpp")}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wide">Status</span>
                  </div>
                  <div className="mt-1">{getStatusBadge(selectedResponse.status)}</div>
                </div>
              </div>

              {/* Answers Section */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Answers ({selectedResponse.answers.length})
                </h4>
                {selectedResponse.answers.length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
                    <p className="text-muted-foreground text-sm">No answers recorded</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedResponse.answers.map((answer, index) => (
                      <div 
                        key={answer.questionId} 
                        className="rounded-lg border bg-gradient-to-br from-muted/30 to-transparent p-4 transition-colors hover:border-primary/30"
                      >
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                          Question {index + 1}
                        </p>
                        <p className="font-medium text-foreground">
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
    </>
  );
}
