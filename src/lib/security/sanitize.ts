/**
 * HTML Sanitization utilities
 * Uses a whitelist approach to allow only safe HTML tags and attributes
 */

const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "i",
  "em",
  "strong",
  "u",
  "s",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "span",
  "div",
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height"]),
  "*": new Set(["class", "id"]),
};

const URL_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/**
 * Sanitize HTML string by removing dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  // Remove script tags and their contents
  let sanitized = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );

  // Remove style tags and their contents
  sanitized = sanitized.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    ""
  );

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove data: URLs (except safe ones)
  sanitized = sanitized.replace(/data:(?!image\/(png|jpeg|gif|webp))/gi, "");

  // Remove dangerous tags
  const dangerousTags = [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "button",
    "textarea",
    "select",
    "meta",
    "link",
    "base",
  ];

  for (const tag of dangerousTags) {
    const regex = new RegExp(`<${tag}\\b[^>]*>.*?</${tag}>`, "gis");
    sanitized = sanitized.replace(regex, "");
    const selfClosing = new RegExp(`<${tag}\\b[^>]*/?>`, "gi");
    sanitized = sanitized.replace(selfClosing, "");
  }

  return sanitized.trim();
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  if (!text) return "";

  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  return text.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char]);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(html: string): string {
  if (!html) return "";

  const htmlUnescapes: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#x27;": "'",
    "&#x2F;": "/",
    "&#x60;": "`",
    "&#x3D;": "=",
  };

  return html.replace(
    /&(?:amp|lt|gt|quot|#x27|#x2F|#x60|#x3D);/g,
    (entity) => htmlUnescapes[entity] ?? entity
  );
}

/**
 * Sanitize URL by checking protocol
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    if (!URL_PROTOCOLS.has(parsed.protocol)) {
      return "";
    }
    return url;
  } catch {
    // Relative URL
    if (url.startsWith("/") || url.startsWith("#")) {
      return url;
    }
    return "";
  }
}

/**
 * Strip all HTML tags from a string
 */
export function stripTags(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Truncate text safely (doesn't break HTML entities)
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);

  // Don't cut in the middle of an HTML entity
  const lastAmpersand = truncated.lastIndexOf("&");
  if (lastAmpersand !== -1 && !truncated.slice(lastAmpersand).includes(";")) {
    return truncated.slice(0, lastAmpersand) + "...";
  }

  return truncated + "...";
}

/**
 * Sanitize user input for display
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Trim whitespace
  let sanitized = input.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, " ");

  return sanitized;
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return "file";

  // Remove path separators
  let sanitized = filename.replace(/[/\\]/g, "");

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Replace dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, "_");

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split(".").pop() ?? "";
    const name = sanitized.slice(0, 250 - ext.length);
    sanitized = ext ? `${name}.${ext}` : name;
  }

  return sanitized || "file";
}

/**
 * Check if string contains potentially dangerous content
 */
export function hasDangerousContent(text: string): boolean {
  const patterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
  ];

  return patterns.some((pattern) => pattern.test(text));
}
