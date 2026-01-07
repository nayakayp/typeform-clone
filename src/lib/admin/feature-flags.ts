import { db } from "@/lib/db";
import { featureFlags } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { logAdminAction } from "./index";

// Get all feature flags
export async function getFeatureFlags() {
  return await db.query.featureFlags.findMany({
    orderBy: [desc(featureFlags.createdAt)],
  });
}

// Get a single feature flag
export async function getFeatureFlag(flagId: string) {
  return await db.query.featureFlags.findFirst({
    where: eq(featureFlags.id, flagId),
  });
}

// Get feature flag by name
export async function getFeatureFlagByName(name: string) {
  return await db.query.featureFlags.findFirst({
    where: eq(featureFlags.name, name),
  });
}

// Check if feature is enabled for user
export async function isFeatureEnabled(
  flagName: string,
  userId?: string,
  workspaceId?: string
): Promise<boolean> {
  const flag = await getFeatureFlagByName(flagName);

  if (!flag || !flag.enabled) {
    return false;
  }

  // Check if user is in target list
  if (userId && flag.targetUsers && flag.targetUsers.length > 0) {
    if (flag.targetUsers.includes(userId)) {
      return true;
    }
  }

  // Check if workspace is in target list
  if (workspaceId && flag.targetWorkspaces && flag.targetWorkspaces.length > 0) {
    if (flag.targetWorkspaces.includes(workspaceId)) {
      return true;
    }
  }

  // Check rollout percentage
  if (flag.rolloutPercentage === 100) {
    return true;
  }

  if (flag.rolloutPercentage > 0 && userId) {
    // Use user ID hash to determine if in rollout
    const hash = hashString(userId);
    const bucket = hash % 100;
    return bucket < flag.rolloutPercentage;
  }

  return false;
}

// Simple hash function for consistent rollout
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Create a feature flag
export async function createFeatureFlag(
  adminId: string,
  data: {
    name: string;
    description?: string;
    enabled?: boolean;
    rolloutPercentage?: number;
  }
): Promise<{ id: string }> {
  const [flag] = await db.insert(featureFlags).values({
    name: data.name,
    description: data.description,
    enabled: data.enabled ?? false,
    rolloutPercentage: data.rolloutPercentage ?? 0,
  }).returning({ id: featureFlags.id });

  await logAdminAction(adminId, "feature_flag.update", {
    targetType: "feature_flag",
    targetId: flag.id,
    metadata: { action: "create", ...data },
  });

  return flag;
}

// Update a feature flag
export async function updateFeatureFlag(
  adminId: string,
  flagId: string,
  updates: {
    name?: string;
    description?: string;
    enabled?: boolean;
    rolloutPercentage?: number;
    targetUsers?: string[];
    targetWorkspaces?: string[];
  }
): Promise<void> {
  await db.update(featureFlags)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(featureFlags.id, flagId));

  await logAdminAction(adminId, "feature_flag.update", {
    targetType: "feature_flag",
    targetId: flagId,
    metadata: updates,
  });
}

// Toggle a feature flag
export async function toggleFeatureFlag(
  adminId: string,
  flagId: string,
  enabled: boolean
): Promise<void> {
  await db.update(featureFlags)
    .set({
      enabled,
      updatedAt: new Date(),
    })
    .where(eq(featureFlags.id, flagId));

  await logAdminAction(adminId, "feature_flag.toggle", {
    targetType: "feature_flag",
    targetId: flagId,
    metadata: { enabled },
  });
}

// Delete a feature flag
export async function deleteFeatureFlag(
  adminId: string,
  flagId: string
): Promise<void> {
  await db.delete(featureFlags).where(eq(featureFlags.id, flagId));

  await logAdminAction(adminId, "feature_flag.update", {
    targetType: "feature_flag",
    targetId: flagId,
    metadata: { action: "delete" },
  });
}
