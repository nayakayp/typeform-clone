import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import fs from "fs/promises";
import path from "path";

export interface UploadOptions {
  responseId?: string;
  questionId?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export interface UploadResult {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export interface UploadService {
  upload(file: File | Buffer, filename: string, mimeType: string, options?: UploadOptions): Promise<UploadResult>;
  delete(fileId: string): Promise<void>;
  getUrl(fileId: string): Promise<string>;
}

// Get upload directory from env or use default
function getUploadDir(): string {
  return process.env.UPLOAD_DIR || "./uploads";
}

// Get max upload size from env or use default (10MB)
function getMaxUploadSize(): number {
  return parseInt(process.env.UPLOAD_MAX_SIZE || "10485760", 10);
}

// Validate file type against allowed types
export function validateFileType(mimeType: string, allowedTypes?: string[]): boolean {
  if (!allowedTypes || allowedTypes.length === 0) return true;

  return allowedTypes.some((allowed) => {
    if (allowed.endsWith("/*")) {
      // Wildcard like 'image/*'
      const prefix = allowed.slice(0, -1);
      return mimeType.startsWith(prefix);
    }
    return mimeType === allowed;
  });
}

// Validate file extension
export function validateFileExtension(filename: string, allowedExtensions?: string[]): boolean {
  if (!allowedExtensions || allowedExtensions.length === 0) return true;

  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

// Local filesystem upload service
export class LocalUploadService implements UploadService {
  private uploadDir: string;

  constructor(uploadDir?: string) {
    this.uploadDir = uploadDir || getUploadDir();
  }

  async upload(
    file: File | Buffer,
    filename: string,
    mimeType: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    // Ensure upload directory exists
    await fs.mkdir(this.uploadDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(filename);
    const uniqueFilename = `${nanoid(16)}${ext}`;
    const filePath = path.join(this.uploadDir, uniqueFilename);

    // Get file buffer
    let buffer: Buffer;
    if (file instanceof Buffer) {
      buffer = file;
    } else {
      buffer = Buffer.from(await file.arrayBuffer());
    }

    // Validate file size
    const maxSize = options?.maxSize || getMaxUploadSize();
    if (buffer.length > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    // Validate file type
    if (!validateFileType(mimeType, options?.allowedTypes)) {
      throw new Error(`File type ${mimeType} is not allowed`);
    }

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    // Create database record
    const [fileRecord] = await db.insert(files).values({
      responseId: options?.responseId,
      questionId: options?.questionId,
      filename: uniqueFilename,
      originalName: filename,
      mimeType,
      size: buffer.length,
      url: `/api/upload/${uniqueFilename}`,
      storageType: "local",
      storageKey: filePath,
    }).returning();

    return {
      id: fileRecord.id,
      url: fileRecord.url,
      filename: uniqueFilename,
      originalName: filename,
      size: buffer.length,
      mimeType,
    };
  }

  async delete(fileId: string): Promise<void> {
    const file = await db.query.files.findFirst({
      where: eq(files.id, fileId),
    });

    if (!file) {
      throw new Error("File not found");
    }

    // Delete from filesystem
    if (file.storageKey) {
      try {
        await fs.unlink(file.storageKey);
      } catch (error) {
        // File may already be deleted
        console.warn("Failed to delete file from filesystem:", error);
      }
    }

    // Delete from database
    await db.delete(files).where(eq(files.id, fileId));
  }

  async getUrl(fileId: string): Promise<string> {
    const file = await db.query.files.findFirst({
      where: eq(files.id, fileId),
    });

    if (!file) {
      throw new Error("File not found");
    }

    return file.url;
  }

  async getFilePath(filename: string): Promise<string> {
    const filePath = path.join(this.uploadDir, filename);

    // Verify file exists
    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      throw new Error("File not found");
    }
  }

  async getFileBuffer(filename: string): Promise<Buffer> {
    const filePath = await this.getFilePath(filename);
    return await fs.readFile(filePath);
  }
}

// Get the appropriate upload service based on configuration
export function getUploadService(): UploadService {
  const provider = process.env.UPLOAD_PROVIDER || "local";

  switch (provider) {
    case "local":
      return new LocalUploadService();
    case "s3":
      // S3 service can be added later
      throw new Error("S3 upload service not yet implemented");
    default:
      return new LocalUploadService();
  }
}

// Helper to format bytes for display
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Default allowed types for common use cases
export const DEFAULT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const DEFAULT_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
export const DEFAULT_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const DEFAULT_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/webm", "audio/ogg"];
