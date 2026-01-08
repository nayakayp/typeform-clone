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
          <Badge variant="outline" className="gap-1.5 border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-3 w-3" />
            Complete
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="gap-1.5 border-primary/50 bg-primary/10 text-primary">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1.5">
            <XCircle className="h-3 w-3" />
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
          <p className="text-muted-foreground text-center max-w-sm text-sm">
            Share your form to start collecting responses. They&apos;ll appear here as they come in.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{responses.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">All Responses</h2>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href={`/api/forms/${formId}/responses/export?format=csv`} download>
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </Button>
      </div>

      {/* Responses Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Respondent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-center">Answers</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response) => (
              <TableRow 
                key={response.id}
                className="cursor-pointer"
                onClick={() => setSelectedResponse(response)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                      {response.email ? response.email[0].toUpperCase() : "A"}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {response.email || "Anonymous"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {response.ipAddress || "Unknown IP"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(response.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(response.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{response.answers?.length || 0}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResponse(response);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
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
              Are you sure you want to delete this response? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteResponseId && deleteResponseMutation.mutate(deleteResponseId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Response Details Dialog */}
      <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-4 mt-2">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Respondent</p>
                  <p className="font-medium">{selectedResponse.email || "Anonymous"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">IP Address</p>
                  <p className="font-medium">{selectedResponse.ipAddress || "Unknown"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">{format(new Date(selectedResponse.createdAt), "PPp")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Status</p>
                  <div>{getStatusBadge(selectedResponse.status)}</div>
                </div>
              </div>

              {/* Answers */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Answers ({selectedResponse.answers.length})</h4>
                {selectedResponse.answers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No answers recorded</p>
                ) : (
                  <div className="space-y-3">
                    {selectedResponse.answers.map((answer, index) => (
                      <div key={answer.questionId} className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          {answer.questionTitle || `Question ${index + 1}`}
                        </p>
                        <p className="text-sm font-medium">
                          {answer.textValue || answer.numberValue || (
                            <span className="text-muted-foreground italic">No answer</span>
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
