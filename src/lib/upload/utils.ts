// Client-safe upload utilities (no server-side imports)

// Helper to format bytes for display
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Validate file type against allowed types
export function validateFileType(
  mimeType: string,
  allowedTypes?: string[]
): boolean {
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

// Default allowed types for common use cases
export const DEFAULT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
export const DEFAULT_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
export const DEFAULT_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const DEFAULT_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
];
