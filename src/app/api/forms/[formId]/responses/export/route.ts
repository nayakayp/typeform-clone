import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  fetchQuestions,
  fetchResponses,
  ExportOptions,
} from "@/lib/export";
import { generateCSVExport } from "@/lib/export/csv";
import { generateExcelExport } from "@/lib/export/excel";
import { generateJSONExport } from "@/lib/export/json";

const exportSchema = z.object({
  format: z.enum(["csv", "excel", "json"]).default("csv"),
  includeMetadata: z.boolean().default(true),
  dateFormat: z.string().default("YYYY-MM-DD HH:mm"),
  questionIds: z.array(z.string()).optional(),
  responseIds: z.array(z.string()).optional(),
  dateRange: z
    .object({
      from: z.string().transform((s) => new Date(s)),
      to: z.string().transform((s) => new Date(s)),
    })
    .optional(),
});

// POST /api/forms/[formId]/responses/export - Export responses
export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    // Verify user owns the form
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const validation = exportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid options", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const options: ExportOptions = {
      format: validation.data.format,
      includeMetadata: validation.data.includeMetadata,
      dateFormat: validation.data.dateFormat,
      questionIds: validation.data.questionIds,
      responseIds: validation.data.responseIds,
      dateRange: validation.data.dateRange,
    };

    // Fetch data
    const [questionsList, responsesList] = await Promise.all([
      fetchQuestions(formId),
      fetchResponses(formId, options),
    ]);

    if (responsesList.length === 0) {
      return NextResponse.json(
        { error: "No responses to export" },
        { status: 400 }
      );
    }

    // Generate export based on format
    let result: { content: string; filename: string; mimeType: string };

    switch (options.format) {
      case "csv":
        result = await generateCSVExport(questionsList, responsesList, options);
        break;
      case "excel":
        result = await generateExcelExport(questionsList, responsesList, options);
        break;
      case "json":
        result = await generateJSONExport(
          formId,
          questionsList,
          responsesList,
          options
        );
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported format" },
          { status: 400 }
        );
    }

    // Return file download
    return new NextResponse(result.content, {
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export responses:", error);
    return NextResponse.json(
      { error: "Failed to export responses" },
      { status: 500 }
    );
  }
}

// GET /api/forms/[formId]/responses/export - Quick CSV export
export async function GET(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    // Verify user owns the form
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "csv") as "csv" | "excel" | "json";

    const options: ExportOptions = {
      format,
      includeMetadata: searchParams.get("includeMetadata") !== "false",
      dateFormat: searchParams.get("dateFormat") || "YYYY-MM-DD HH:mm",
    };

    // Fetch data
    const [questionsList, responsesList] = await Promise.all([
      fetchQuestions(formId),
      fetchResponses(formId, options),
    ]);

    if (responsesList.length === 0) {
      return NextResponse.json(
        { error: "No responses to export" },
        { status: 400 }
      );
    }

    // Generate export based on format
    let result: { content: string; filename: string; mimeType: string };

    switch (format) {
      case "csv":
        result = await generateCSVExport(questionsList, responsesList, options);
        break;
      case "excel":
        result = await generateExcelExport(questionsList, responsesList, options);
        break;
      case "json":
        result = await generateJSONExport(
          formId,
          questionsList,
          responsesList,
          options
        );
        break;
      default:
        result = await generateCSVExport(questionsList, responsesList, options);
    }

    // Return file download
    return new NextResponse(result.content, {
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export responses:", error);
    return NextResponse.json(
      { error: "Failed to export responses" },
      { status: 500 }
    );
  }
}
