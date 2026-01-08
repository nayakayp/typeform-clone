"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
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
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Complete
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <XCircle className="h-3 w-3" />
            Partial
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
          <p className="text-muted-foreground text-center">
            Share your form to start collecting responses
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" asChild>
          <Link href={`/api/forms/${formId}/responses/export?format=csv`}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Link>
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Respondent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response) => (
              <TableRow key={response.id}>
                <TableCell>
                  <div className="font-medium">
                    {response.email || "Anonymous"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {response.ipAddress || "Unknown IP"}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(response.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(response.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedResponse(response)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteResponseId(response.id)}
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
            <DialogTitle>Response Details</DialogTitle>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-6">
              {/* Respondent Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Respondent</p>
                  <p className="font-medium">{selectedResponse.email || "Anonymous"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-medium">{selectedResponse.ipAddress || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {format(new Date(selectedResponse.createdAt), "PPpp")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedResponse.status)}
                </div>
              </div>

              {/* Answers */}
              <div>
                <h4 className="font-semibold mb-3">Answers</h4>
                {selectedResponse.answers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No answers recorded</p>
                ) : (
                  <div className="space-y-3">
                    {selectedResponse.answers.map((answer, index) => (
                      <div key={answer.questionId} className="border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">
                          Question {index + 1}
                        </p>
                        <p className="font-medium">
                          {answer.textValue || answer.numberValue || "No answer"}
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
