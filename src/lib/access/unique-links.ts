import { db } from "@/lib/db";
import { uniqueLinks, forms } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { generateLinkToken } from "./middleware";

// Create unique links for a form
export async function createUniqueLinks(
  formId: string,
  links: {
    email?: string;
    name?: string;
    metadata?: Record<string, unknown>;
    expiresAt?: Date;
    maxUses?: number;
  }[]
): Promise<{ token: string; email?: string; name?: string }[]> {
  const values = links.map((link) => ({
    formId,
    token: generateLinkToken(),
    email: link.email,
    name: link.name,
    metadata: link.metadata,
    expiresAt: link.expiresAt,
    maxUses: link.maxUses || 1,
  }));

  const created = await db.insert(uniqueLinks).values(values).returning();

  return created.map((l) => ({
    token: l.token,
    email: l.email || undefined,
    name: l.name || undefined,
  }));
}

// Get unique links for a form
export async function getUniqueLinks(
  formId: string,
  options: { limit?: number; offset?: number; includeUsed?: boolean } = {}
): Promise<
  {
    id: string;
    token: string;
    email: string | null;
    name: string | null;
    expiresAt: Date | null;
    maxUses: number;
    useCount: number;
    isActive: boolean;
    createdAt: Date;
    lastUsedAt: Date | null;
  }[]
> {
  const { limit = 50, offset = 0, includeUsed = true } = options;

  const conditions = [eq(uniqueLinks.formId, formId)];

  if (!includeUsed) {
    conditions.push(eq(uniqueLinks.isActive, true));
  }

  return db.query.uniqueLinks.findMany({
    where: and(...conditions),
    orderBy: [desc(uniqueLinks.createdAt)],
    limit,
    offset,
  });
}

// Validate unique link
export async function validateUniqueLink(
  formId: string,
  token: string
): Promise<{
  valid: boolean;
  link?: {
    email?: string;
    name?: string;
    metadata?: Record<string, unknown>;
  };
  reason?: string;
}> {
  const link = await db.query.uniqueLinks.findFirst({
    where: and(
      eq(uniqueLinks.formId, formId),
      eq(uniqueLinks.token, token)
    ),
  });

  if (!link) {
    return { valid: false, reason: "not_found" };
  }

  if (!link.isActive) {
    return { valid: false, reason: "deactivated" };
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return { valid: false, reason: "expired" };
  }

  if (link.useCount >= link.maxUses) {
    return { valid: false, reason: "used" };
  }

  return {
    valid: true,
    link: {
      email: link.email || undefined,
      name: link.name || undefined,
      metadata: link.metadata as Record<string, unknown> | undefined,
    },
  };
}

// Deactivate unique link
export async function deactivateUniqueLink(
  formId: string,
  linkId: string
): Promise<boolean> {
  const result = await db
    .update(uniqueLinks)
    .set({ isActive: false })
    .where(and(eq(uniqueLinks.formId, formId), eq(uniqueLinks.id, linkId)))
    .returning();

  return result.length > 0;
}

// Delete unique link
export async function deleteUniqueLink(
  formId: string,
  linkId: string
): Promise<boolean> {
  const result = await db
    .delete(uniqueLinks)
    .where(and(eq(uniqueLinks.formId, formId), eq(uniqueLinks.id, linkId)))
    .returning();

  return result.length > 0;
}

// Build unique link URL
export function buildUniqueLinkUrl(
  formSlug: string,
  token: string,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
): string {
  return `${baseUrl}/f/${formSlug}?token=${token}`;
}
