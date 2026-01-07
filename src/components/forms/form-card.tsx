"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Eye,
  BarChart3,
  Copy,
  Trash2,
  ExternalLink,
  Share2,
} from "lucide-react";

interface FormCardProps {
  form: {
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
  };
  onDelete?: (formId: string) => void;
  onDuplicate?: (formId: string) => void;
}

export function FormCard({ form, onDelete, onDuplicate }: FormCardProps) {
  const responseCount = form._count?.responses ?? 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Published</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <Link
              href={`/forms/${form.id}/edit`}
              className="font-semibold text-lg hover:underline truncate block"
            >
              {form.title}
            </Link>
            {form.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {form.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/forms/${form.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/f/${form.slug}`} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/forms/${form.id}/responses`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Responses
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/forms/${form.id}/analytics`}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDuplicate?.(form.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(form.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{responseCount} responses</span>
          <span>Updated {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          {getStatusBadge(form.status)}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/forms/${form.id}/edit`}>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Link>
            </Button>
            {form.status === "published" && (
              <Button size="sm" asChild>
                <Link href={`/f/${form.slug}`} target="_blank">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
