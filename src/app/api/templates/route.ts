import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { TEMPLATE_CATEGORIES, TemplateCategory } from "@/lib/db/schema";
import {
  getTemplates,
  saveAsTemplate,
  getTemplateCategoryCounts,
} from "@/lib/versions";

const saveTemplateSchema = z.object({
  formId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
  isPublic: z.boolean().optional(),
  workspaceId: z.string().uuid().optional(),
});

// GET /api/templates - List templates
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as TemplateCategory | null;
    const search = searchParams.get("search") || undefined;
    const workspaceId = searchParams.get("workspaceId") || undefined;
    const featured = searchParams.get("featured") === "true";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const categoryCounts = searchParams.get("categoryCounts") === "true";

    const templates = await getTemplates({
      category: category || undefined,
      search,
      workspaceId,
      publicOnly: !workspaceId,
      featured: featured || undefined,
      limit,
      offset,
    });

    let counts = null;
    if (categoryCounts) {
      counts = await getTemplateCategoryCounts();
    }

    return NextResponse.json({
      templates,
      categories: counts,
    });
  } catch (error) {
    console.error("Failed to get templates:", error);
    return NextResponse.json(
      { error: "Failed to get templates" },
      { status: 500 }
    );
  }
}

// POST /api/templates - Save form as template
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = saveTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const template = await saveAsTemplate(
      validation.data.formId,
      session.user.id,
      {
        name: validation.data.name,
        description: validation.data.description,
        category: validation.data.category,
        isPublic: validation.data.isPublic,
        workspaceId: validation.data.workspaceId,
      }
    );

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Failed to save template:", error);
    return NextResponse.json(
      { error: "Failed to save template" },
      { status: 500 }
    );
  }
}
