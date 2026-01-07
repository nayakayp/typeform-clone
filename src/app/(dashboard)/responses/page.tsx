"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Form {
  id: string;
  title: string;
  status: string;
}

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

export default function ResponsesPage() {
  const queryClient = useQueryClient();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [deleteResponseId, setDeleteResponseId] = useState<string | null>(null);

  const { data: formsData, isLoading: formsLoading } = useQuery({
    queryKey: ["forms-for-responses"],
    queryFn: async () => {
      const res = await fetch("/api/forms");
      if (!res.ok) throw new Error("Failed to fetch forms");
      return res.json();
    },
  });

  const forms: Form[] = formsData?.forms ?? [];

  // Auto-select first form if none selected
  if (!selectedFormId && forms.length > 0) {
    setSelectedFormId(forms[0].id);
  }

  const { data: responsesData, isLoading: responsesLoading } = useQuery({
    queryKey: ["responses", selectedFormId],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${selectedFormId}/responses`);
      if (!res.ok) throw new Error("Failed to fetch responses");
      return res.json();
    },
    enabled: !!selectedFormId,
  });

  const responses: Response[] = responsesData?.responses ?? [];

  const deleteResponseMutation = useMutation({
    mutationFn: async (responseId: string) => {
      const res = await fetch(`/api/forms/${selectedFormId}/responses/${responseId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete response");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses", selectedFormId] });
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

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Responses</h1>
          <p className="text-muted-foreground">
            View and manage form submissions
          </p>
        </div>

        <div className="flex items-center gap-4">
          {forms.length > 0 && (
            <Select
              value={selectedFormId ?? undefined}
              onValueChange={setSelectedFormId}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a form" />
              </SelectTrigger>
              <SelectContent>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedFormId && responses.length > 0 && (
            <Button variant="outline" asChild>
              <Link href={`/api/forms/${selectedFormId}/responses/export?format=csv`}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Link>
            </Button>
          )}
        </div>
      </div>

      {formsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create a form to start collecting responses
            </p>
            <Button asChild>
              <Link href="/forms">Go to Forms</Link>
            </Button>
          </CardContent>
        </Card>
      ) : responsesLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : responses.length === 0 ? (
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
      ) : (
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
                        <DropdownMenuItem>
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
      )}

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
    </div>
  );
}
