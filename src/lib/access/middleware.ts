import { db } from "@/lib/db";
import {
  forms,
  responses,
  uniqueLinks,
  responseTracking,
  FormAccessSettings,
} from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { randomBytes } from "crypto";

// Access check result
export interface AccessResult {
  allowed: boolean;
  reason?:
    | "not_published"
    | "not_open_yet"
    | "closed"
    | "max_responses"
    | "already_responded"
    | "password_required"
    | "invalid_password"
    | "ip_blocked"
    | "invalid_link"
    | "link_expired"
    | "link_used";
  message?: string;
  opensAt?: string;
  existingResponseId?: string;
  allowEdit?: boolean;
  remainingSpots?: number;
}

// Get client IP from request
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Generate unique link token
export function generateLinkToken(): string {
  return randomBytes(24).toString("base64url");
}

// Get response count for a form
export async function getResponseCount(formId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(responses)
    .where(and(eq(responses.formId, formId), eq(responses.isComplete, true)));
  return result?.count || 0;
}

// Check if fingerprint has already responded
export async function checkExistingResponse(
  formId: string,
  fingerprint: string,
  fingerprintType: string
): Promise<{ exists: boolean; responseId?: string }> {
  const tracking = await db.query.responseTracking.findFirst({
    where: and(
      eq(responseTracking.formId, formId),
      eq(responseTracking.fingerprint, fingerprint),
      eq(responseTracking.fingerprintType, fingerprintType)
    ),
  });

  if (tracking?.responseId) {
    return { exists: true, responseId: tracking.responseId };
  }

  return { exists: false };
}

// Check if IP is in CIDR range
function isIpInCidr(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split("/");
  const mask = parseInt(bits) || 32;

  const ipParts = ip.split(".").map(Number);
  const rangeParts = range.split(".").map(Number);

  if (ipParts.length !== 4 || rangeParts.length !== 4) {
    return false;
  }

  const ipNum =
    (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
  const rangeNum =
    (rangeParts[0] << 24) |
    (rangeParts[1] << 16) |
    (rangeParts[2] << 8) |
    rangeParts[3];
  const maskNum = ~((1 << (32 - mask)) - 1);

  return (ipNum & maskNum) === (rangeNum & maskNum);
}

// Check if IP is allowed
export function isIpAllowed(
  ip: string,
  restrictions: FormAccessSettings["ipRestrictions"]
): boolean {
  if (!restrictions) return true;

  // Check blocklist first
  if (restrictions.blocklist?.length) {
    for (const blocked of restrictions.blocklist) {
      if (ip === blocked || isIpInCidr(ip, blocked)) {
        return false;
      }
    }
  }

  // Check allowlist
  if (restrictions.allowlist?.length) {
    for (const allowed of restrictions.allowlist) {
      if (ip === allowed || isIpInCidr(ip, allowed)) {
        return true;
      }
    }
    // If allowlist exists and IP not in it, block
    return false;
  }

  return true;
}

// Main access check function
export async function checkFormAccess(
  formId: string,
  request: Request,
  options: {
    sessionPassword?: string;
    linkToken?: string;
    visitorCookie?: string;
    userEmail?: string;
    userId?: string;
  } = {}
): Promise<AccessResult> {
  // Get form with access settings
  const form = await db.query.forms.findFirst({
    where: eq(forms.id, formId),
  });

  if (!form) {
    return { allowed: false, reason: "not_published" };
  }

  // Check if form is published
  if (form.status !== "published") {
    return { allowed: false, reason: "not_published" };
  }

  const settings = (form.settings as { access?: FormAccessSettings })?.access;
  if (!settings) {
    // No access restrictions
    return { allowed: true };
  }

  const now = new Date();

  // Check schedule
  if (settings.schedule) {
    if (settings.schedule.openAt) {
      const openAt = new Date(settings.schedule.openAt);
      if (now < openAt) {
        return {
          allowed: false,
          reason: "not_open_yet",
          message: settings.schedule.beforeOpenMessage,
          opensAt: settings.schedule.openAt,
        };
      }
    }
    if (settings.schedule.closeAt) {
      const closeAt = new Date(settings.schedule.closeAt);
      if (now > closeAt) {
        return {
          allowed: false,
          reason: "closed",
          message: settings.schedule.afterCloseMessage,
        };
      }
    }
  }

  // Check response limit
  if (settings.responseLimit?.maxResponses) {
    const currentCount = await getResponseCount(formId);
    if (currentCount >= settings.responseLimit.maxResponses) {
      return {
        allowed: false,
        reason: "max_responses",
        message: settings.responseLimit.closedMessage,
      };
    }
  }

  // Check unique link if provided
  if (options.linkToken) {
    const link = await db.query.uniqueLinks.findFirst({
      where: and(
        eq(uniqueLinks.formId, formId),
        eq(uniqueLinks.token, options.linkToken),
        eq(uniqueLinks.isActive, true)
      ),
    });

    if (!link) {
      return { allowed: false, reason: "invalid_link" };
    }

    if (link.expiresAt && new Date(link.expiresAt) < now) {
      return { allowed: false, reason: "link_expired" };
    }

    if (link.useCount >= link.maxUses) {
      return { allowed: false, reason: "link_used" };
    }
  }

  // Check single response
  if (settings.singleResponse?.enabled) {
    let fingerprint: string | null = null;
    let fingerprintType = settings.singleResponse.method;

    switch (settings.singleResponse.method) {
      case "cookie":
        fingerprint = options.visitorCookie || null;
        break;
      case "ip":
        fingerprint = getClientIp(request);
        break;
      case "email":
        fingerprint = options.userEmail || null;
        break;
      case "user":
        fingerprint = options.userId || null;
        break;
    }

    if (fingerprint) {
      const existing = await checkExistingResponse(
        formId,
        fingerprint,
        fingerprintType
      );
      if (existing.exists) {
        return {
          allowed: false,
          reason: "already_responded",
          existingResponseId: existing.responseId,
          allowEdit: settings.singleResponse.allowEdit,
        };
      }
    }
  }

  // Check password protection
  if (settings.passwordProtection?.enabled) {
    if (!options.sessionPassword) {
      return {
        allowed: false,
        reason: "password_required",
        message: settings.passwordProtection.message,
      };
    }
    const valid = await verifyPassword(
      options.sessionPassword,
      settings.passwordProtection.passwordHash
    );
    if (!valid) {
      return { allowed: false, reason: "invalid_password" };
    }
  }

  // Check IP restrictions
  const ip = getClientIp(request);
  if (settings.ipRestrictions && !isIpAllowed(ip, settings.ipRestrictions)) {
    return { allowed: false, reason: "ip_blocked" };
  }

  // Calculate remaining spots if applicable
  let remainingSpots: number | undefined;
  if (settings.responseLimit?.showRemaining) {
    const currentCount = await getResponseCount(formId);
    remainingSpots = settings.responseLimit.maxResponses - currentCount;
  }

  return { allowed: true, remainingSpots };
}

// Record response for tracking
export async function recordResponse(
  formId: string,
  responseId: string,
  fingerprint: string,
  fingerprintType: string
): Promise<void> {
  await db.insert(responseTracking).values({
    formId,
    responseId,
    fingerprint,
    fingerprintType,
  });
}

// Use unique link
export async function useUniqueLink(token: string): Promise<boolean> {
  const result = await db
    .update(uniqueLinks)
    .set({
      useCount: eq(uniqueLinks.useCount, 0)
        ? 1
        : (uniqueLinks.useCount as unknown as number) + 1,
      lastUsedAt: new Date(),
    })
    .where(eq(uniqueLinks.token, token))
    .returning();

  return result.length > 0;
}
