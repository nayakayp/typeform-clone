import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";
import { apiKeys, ApiKey, ApiPermission, NewApiKey } from "@/lib/db/schema";
import { eq, and, isNull, gt } from "drizzle-orm";

// API key prefix for identification
const API_KEY_PREFIX = "tf_live_";

// Generate a new API key
export function generateApiKey(): {
  key: string;
  hash: string;
  prefix: string;
  suffix: string;
} {
  const random = randomBytes(24).toString("base64url");
  const key = API_KEY_PREFIX + random;
  const hash = createHash("sha256").update(key).digest("hex");
  const suffix = key.slice(-4);

  return { key, hash, prefix: API_KEY_PREFIX, suffix };
}

// Hash an API key for comparison
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

// Create a new API key for a workspace
export async function createApiKey(
  workspaceId: string,
  name: string,
  permissions: ApiPermission[] = ["*"],
  expiresAt?: Date
): Promise<{ apiKey: ApiKey; plainTextKey: string }> {
  const { key, hash, prefix, suffix } = generateApiKey();

  const [apiKey] = await db
    .insert(apiKeys)
    .values({
      workspaceId,
      name,
      keyHash: hash,
      prefix,
      suffix,
      permissions,
      expiresAt,
    })
    .returning();

  return { apiKey, plainTextKey: key };
}

// Validate an API key and return the key record
export async function validateApiKey(
  key: string
): Promise<{ valid: false; error: string } | { valid: true; apiKey: ApiKey }> {
  // Check prefix
  if (!key.startsWith(API_KEY_PREFIX)) {
    return { valid: false, error: "Invalid API key format" };
  }

  const hash = hashApiKey(key);

  const apiKey = await db.query.apiKeys.findFirst({
    where: and(
      eq(apiKeys.keyHash, hash),
      isNull(apiKeys.revokedAt) // Not revoked
    ),
  });

  if (!apiKey) {
    return { valid: false, error: "Invalid API key" };
  }

  // Check expiration
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false, error: "API key expired" };
  }

  // Update last used timestamp (fire and forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id))
    .execute()
    .catch(() => {
      // Ignore errors
    });

  return { valid: true, apiKey };
}

// Check if an API key has a specific permission
export function hasPermission(
  apiKey: ApiKey,
  requiredPermission: ApiPermission
): boolean {
  const permissions = apiKey.permissions as ApiPermission[];

  // Wildcard permission
  if (permissions.includes("*")) {
    return true;
  }

  // Direct permission match
  if (permissions.includes(requiredPermission)) {
    return true;
  }

  // Check for resource-level wildcard (e.g., "forms:*" for "forms:read")
  const [resource] = requiredPermission.split(":");
  if (permissions.includes(`${resource}:*` as ApiPermission)) {
    return true;
  }

  return false;
}

// List API keys for a workspace
export async function listApiKeys(workspaceId: string): Promise<ApiKey[]> {
  return db.query.apiKeys.findMany({
    where: and(
      eq(apiKeys.workspaceId, workspaceId),
      isNull(apiKeys.revokedAt)
    ),
    orderBy: (apiKeys, { desc }) => [desc(apiKeys.createdAt)],
  });
}

// Get a single API key by ID
export async function getApiKey(
  id: string,
  workspaceId: string
): Promise<ApiKey | undefined> {
  return db.query.apiKeys.findFirst({
    where: and(
      eq(apiKeys.id, id),
      eq(apiKeys.workspaceId, workspaceId),
      isNull(apiKeys.revokedAt)
    ),
  });
}

// Revoke an API key
export async function revokeApiKey(
  id: string,
  workspaceId: string
): Promise<boolean> {
  const result = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(apiKeys.id, id),
        eq(apiKeys.workspaceId, workspaceId),
        isNull(apiKeys.revokedAt)
      )
    )
    .returning();

  return result.length > 0;
}

// Update API key name or permissions
export async function updateApiKey(
  id: string,
  workspaceId: string,
  updates: { name?: string; permissions?: ApiPermission[] }
): Promise<ApiKey | undefined> {
  const [updated] = await db
    .update(apiKeys)
    .set(updates)
    .where(
      and(
        eq(apiKeys.id, id),
        eq(apiKeys.workspaceId, workspaceId),
        isNull(apiKeys.revokedAt)
      )
    )
    .returning();

  return updated;
}

// Get API key usage statistics
export async function getApiKeyStats(workspaceId: string): Promise<{
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
}> {
  const allKeys = await db.query.apiKeys.findMany({
    where: eq(apiKeys.workspaceId, workspaceId),
  });

  const now = new Date();
  const activeKeys = allKeys.filter(
    (k) => !k.revokedAt && (!k.expiresAt || k.expiresAt > now)
  );
  const expiredKeys = allKeys.filter(
    (k) => !k.revokedAt && k.expiresAt && k.expiresAt <= now
  );

  return {
    totalKeys: allKeys.length,
    activeKeys: activeKeys.length,
    expiredKeys: expiredKeys.length,
  };
}
