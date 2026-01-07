import { NextResponse } from "next/server";
import { getUploadService, validateFileType, validateFileExtension } from "@/lib/upload";

// POST /api/upload - Upload a file
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const responseId = formData.get("responseId") as string | null;
    const questionId = formData.get("questionId") as string | null;
    const maxSize = formData.get("maxSize") as string | null;
    const allowedTypes = formData.get("allowedTypes") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Parse allowed types if provided
    const parsedAllowedTypes = allowedTypes ? JSON.parse(allowedTypes) : undefined;

    const uploadService = getUploadService();
    const result = await uploadService.upload(file, file.name, file.type, {
      responseId: responseId || undefined,
      questionId: questionId || undefined,
      maxSize: maxSize ? parseInt(maxSize, 10) : undefined,
      allowedTypes: parsedAllowedTypes,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
