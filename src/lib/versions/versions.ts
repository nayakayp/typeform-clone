import { db } from "@/lib/db";
import { formVersions, forms, questions, questionOptions, FormSnapshot } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

// Get next version number for a form
async function getNextVersion(formId: string): Promise<number> {
  const result = await db
    .select({ maxVersion: sql<number>`COALESCE(MAX(${formVersions.version}), 0)` })
    .from(formVersions)
    .where(eq(formVersions.formId, formId));

  return (result[0]?.maxVersion ?? 0) + 1;
}

// Create a snapshot of the current form state
export async function createFormSnapshot(formId: string): Promise<FormSnapshot> {
  const form = await db.query.forms.findFirst({
    where: eq(forms.id, formId),
  });

  if (!form) {
    throw new Error("Form not found");
  }

  const formQuestions = await db.query.questions.findMany({
    where: eq(questions.formId, formId),
    with: {
      options: {
        orderBy: (options, { asc }) => [asc(options.order)],
      },
    },
    orderBy: [questions.order],
  });

  return {
    title: form.title,
    description: form.description,
    settings: (form.settings as Record<string, unknown>) || {},
    questions: formQuestions.map((q) => ({
      id: q.id,
      type: q.type,
      title: q.title || "",
      description: q.description || undefined,
      required: q.required ?? false,
      order: q.order,
      settings: (q.settings as Record<string, unknown>) || {},
      options: q.options?.map((o) => ({
        id: o.id,
        value: o.value || "",
        order: o.order,
      })),
    })),
    theme: (form.themeId ? {} : undefined), // Could expand to include full theme
  };
}

// Save a new version
export async function saveVersion(
  formId: string,
  userId: string,
  options?: {
    description?: string;
    label?: string;
  }
): Promise<{ id: string; version: number }> {
  const snapshot = await createFormSnapshot(formId);
  const version = await getNextVersion(formId);

  const [newVersion] = await db.insert(formVersions).values({
    formId,
    version,
    snapshot,
    changeDescription: options?.description,
    label: options?.label,
    createdBy: userId,
  }).returning({ id: formVersions.id, version: formVersions.version });

  return newVersion;
}

// Get all versions for a form
export async function getVersions(
  formId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  const { limit = 50, offset = 0 } = options || {};

  return await db.query.formVersions.findMany({
    where: eq(formVersions.formId, formId),
    with: {
      createdByUser: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(formVersions.version)],
    limit,
    offset,
  });
}

// Get a specific version
export async function getVersion(versionId: string) {
  return await db.query.formVersions.findFirst({
    where: eq(formVersions.id, versionId),
    with: {
      createdByUser: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

// Restore a form to a previous version
export async function restoreVersion(
  formId: string,
  versionId: string,
  userId: string
): Promise<{ id: string; version: number }> {
  const version = await getVersion(versionId);

  if (!version || version.formId !== formId) {
    throw new Error("Version not found");
  }

  // Save current state as a new version first
  await saveVersion(formId, userId, {
    description: `Before restore to version ${version.version}`,
  });

  // Apply the snapshot
  await applySnapshot(formId, version.snapshot);

  // Save restored state as new version
  return await saveVersion(formId, userId, {
    description: `Restored from version ${version.version}`,
  });
}

// Apply a snapshot to a form
async function applySnapshot(formId: string, snapshot: FormSnapshot): Promise<void> {
  // Update form title, description, settings
  await db.update(forms)
    .set({
      title: snapshot.title,
      description: snapshot.description,
      settings: snapshot.settings,
      updatedAt: new Date(),
    })
    .where(eq(forms.id, formId));

  // Delete existing questions and their options
  await db.delete(questions).where(eq(questions.formId, formId));

  // Insert questions from snapshot
  for (const q of snapshot.questions) {
    const [newQuestion] = await db.insert(questions).values({
      formId,
      type: q.type as typeof questions.$inferInsert.type,
      title: q.title,
      description: q.description,
      required: q.required,
      order: q.order,
      settings: q.settings as typeof questions.$inferInsert.settings,
    }).returning({ id: questions.id });

    // Insert options if any
    if (q.options && q.options.length > 0) {
      await db.insert(questionOptions).values(
        q.options.map((o) => ({
          questionId: newQuestion.id,
          label: o.value, // Use value as label
          value: o.value,
          order: o.order,
        }))
      );
    }
  }
}

// Compare two versions (diff)
export function compareVersions(
  version1: FormSnapshot,
  version2: FormSnapshot
): {
  titleChanged: boolean;
  descriptionChanged: boolean;
  settingsChanged: boolean;
  questionsAdded: string[];
  questionsRemoved: string[];
  questionsModified: string[];
} {
  const v1QuestionIds = new Set(version1.questions.map(q => q.id));
  const v2QuestionIds = new Set(version2.questions.map(q => q.id));

  const questionsAdded = version2.questions
    .filter(q => !v1QuestionIds.has(q.id))
    .map(q => q.title);

  const questionsRemoved = version1.questions
    .filter(q => !v2QuestionIds.has(q.id))
    .map(q => q.title);

  const questionsModified: string[] = [];
  for (const q2 of version2.questions) {
    const q1 = version1.questions.find(q => q.id === q2.id);
    if (q1) {
      if (
        q1.title !== q2.title ||
        q1.description !== q2.description ||
        q1.required !== q2.required ||
        JSON.stringify(q1.settings) !== JSON.stringify(q2.settings) ||
        JSON.stringify(q1.options) !== JSON.stringify(q2.options)
      ) {
        questionsModified.push(q2.title);
      }
    }
  }

  return {
    titleChanged: version1.title !== version2.title,
    descriptionChanged: version1.description !== version2.description,
    settingsChanged: JSON.stringify(version1.settings) !== JSON.stringify(version2.settings),
    questionsAdded,
    questionsRemoved,
    questionsModified,
  };
}

// Update version label
export async function updateVersionLabel(
  versionId: string,
  label: string | null
): Promise<void> {
  await db.update(formVersions)
    .set({ label })
    .where(eq(formVersions.id, versionId));
}

// Auto-save trigger - create version if significant changes
export async function autoSaveVersion(
  formId: string,
  userId: string,
  currentSnapshot: FormSnapshot
): Promise<{ id: string; version: number } | null> {
  // Get the latest version
  const [latestVersion] = await db.query.formVersions.findMany({
    where: eq(formVersions.formId, formId),
    orderBy: [desc(formVersions.version)],
    limit: 1,
  });

  if (!latestVersion) {
    // First version - save it
    return await saveVersion(formId, userId, {
      description: "Initial version",
    });
  }

  // Compare with latest
  const diff = compareVersions(latestVersion.snapshot, currentSnapshot);

  // Only save if there are meaningful changes
  const hasChanges =
    diff.titleChanged ||
    diff.descriptionChanged ||
    diff.questionsAdded.length > 0 ||
    diff.questionsRemoved.length > 0 ||
    diff.questionsModified.length > 0;

  if (hasChanges) {
    const changeDescParts: string[] = [];
    if (diff.titleChanged) changeDescParts.push("Title changed");
    if (diff.questionsAdded.length > 0) changeDescParts.push(`Added ${diff.questionsAdded.length} question(s)`);
    if (diff.questionsRemoved.length > 0) changeDescParts.push(`Removed ${diff.questionsRemoved.length} question(s)`);
    if (diff.questionsModified.length > 0) changeDescParts.push(`Modified ${diff.questionsModified.length} question(s)`);

    return await saveVersion(formId, userId, {
      description: changeDescParts.join(", ") || "Auto-saved changes",
    });
  }

  return null;
}
