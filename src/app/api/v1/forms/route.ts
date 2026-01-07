import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq, and, count, desc, asc } from "drizzle-orm";
import {
  withApiAuth,
  apiSuccess,
  apiError,
  parsePagination,
  buildPaginationMeta,
  ApiAuthResult,
  checkApiRateLimit,
  addRateLimitHeaders,
  rateLimitError,
} from "@/lib/api";
import { z } from "zod";

// Create form schema
const createFormSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
  isPublic: z.boolean().optional(),
});

// GET /api/v1/forms - List forms
export const GET = withApiAuth(
  async (request: NextRequest, auth: ApiAuthResult) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    const { page, perPage, offset } = parsePagination(request);
    const url = new URL(request.url);
    const status = url.searchParams.get("status"); // draft, published, closed
    const sortBy = url.searchParams.get("sort") || "createdAt";
    const sortOrder = url.searchParams.get("order") || "desc";

    // Build where clause
    const whereClause = status
      ? and(
          eq(forms.workspaceId, auth.workspaceId),
          eq(forms.status, status)
        )
      : eq(forms.workspaceId, auth.workspaceId);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(forms)
      .where(whereClause);

    const total = totalResult?.count || 0;

    // Get forms with sorting
    const orderByColumn =
      sortBy === "title"
        ? forms.title
        : sortBy === "updatedAt"
          ? forms.updatedAt
          : forms.createdAt;

    const formsList = await db
      .select({
        id: forms.id,
        title: forms.title,
        description: forms.description,
        slug: forms.slug,
        status: forms.status,
        isPublic: forms.isPublic,
        settings: forms.settings,
        publishedAt: forms.publishedAt,
        closedAt: forms.closedAt,
        createdAt: forms.createdAt,
        updatedAt: forms.updatedAt,
      })
      .from(forms)
      .where(whereClause)
      .orderBy(sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn))
      .limit(perPage)
      .offset(offset);

    const response = apiSuccess(formsList, {
      pagination: buildPaginationMeta(total, page, perPage),
    });

    return addRateLimitHeaders(response, rateLimit.headers);
  },
  { permission: "forms:read" }
);

// POST /api/v1/forms - Create form
export const POST = withApiAuth(
  async (request: NextRequest, auth: ApiAuthResult) => {
    // Rate limit check
    const rateLimit = await checkApiRateLimit(request, auth);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.retryAfter || 60, rateLimit.headers);
    }

    try {
      const body = await request.json();
      const parsed = createFormSchema.safeParse(body);

      if (!parsed.success) {
        return apiError(
          "validation_error",
          "Invalid request body",
          400,
          { errors: parsed.error.flatten().fieldErrors }
        );
      }

      const { title, description, settings, isPublic } = parsed.data;

      // Generate a unique slug
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80) + "-" + Date.now().toString(36);

      // We need a createdBy user - for API, we'll use a system user or the workspace owner
      // For now, we'll need to get the workspace owner
      const workspace = await db.query.workspaces.findFirst({
        where: (w, { eq }) => eq(w.id, auth.workspaceId),
      });

      if (!workspace) {
        return apiError("workspace_not_found", "Workspace not found", 404);
      }

      const [newForm] = await db
        .insert(forms)
        .values({
          workspaceId: auth.workspaceId,
          createdBy: workspace.ownerId,
          title,
          description,
          slug,
          settings: settings as Record<string, unknown>,
          isPublic: isPublic ?? true,
        })
        .returning();

      const response = apiSuccess(newForm);
      response.headers.set("Location", `/api/v1/forms/${newForm.id}`);

      return addRateLimitHeaders(response, rateLimit.headers);
    } catch (error) {
      console.error("Error creating form:", error);
      return apiError("internal_error", "Failed to create form", 500);
    }
  },
  { permission: "forms:write" }
);
