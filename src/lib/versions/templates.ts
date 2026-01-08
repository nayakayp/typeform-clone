import { db } from "@/lib/db";
import { formTemplates, forms, questions, questionOptions, FormSnapshot, TemplateCategory } from "@/lib/db/schema";
import { eq, and, or, ilike, sql, desc, asc } from "drizzle-orm";
import { createFormSnapshot } from "./versions";
import { nanoid } from "nanoid";

// Get templates with filtering
export async function getTemplates(options?: {
  category?: TemplateCategory;
  search?: string;
  workspaceId?: string;
  publicOnly?: boolean;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const {
    category,
    search,
    workspaceId,
    publicOnly = true,
    featured,
    limit = 20,
    offset = 0,
  } = options || {};

  const conditions: Parameters<typeof and>[0][] = [];

  if (publicOnly) {
    conditions.push(eq(formTemplates.isPublic, true));
  } else if (workspaceId) {
    // Show public templates and workspace-specific ones
    conditions.push(
      or(
        eq(formTemplates.isPublic, true),
        eq(formTemplates.workspaceId, workspaceId)
      )
    );
  }

  if (category) {
    conditions.push(eq(formTemplates.category, category));
  }

  if (featured) {
    conditions.push(eq(formTemplates.isFeatured, true));
  }

  if (search) {
    conditions.push(
      or(
        ilike(formTemplates.name, `%${search}%`),
        ilike(formTemplates.description, `%${search}%`)
      )
    );
  }

  return await db.query.formTemplates.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      createdByUser: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [desc(formTemplates.isFeatured), desc(formTemplates.usageCount)],
    limit,
    offset,
  });
}

// Get a single template
export async function getTemplate(templateId: string) {
  return await db.query.formTemplates.findFirst({
    where: eq(formTemplates.id, templateId),
    with: {
      createdByUser: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });
}

// Save a form as a template
export async function saveAsTemplate(
  formId: string,
  userId: string,
  options: {
    name: string;
    description?: string;
    category?: TemplateCategory;
    isPublic?: boolean;
    workspaceId?: string;
  }
): Promise<{ id: string }> {
  const snapshot = await createFormSnapshot(formId);

  const [template] = await db.insert(formTemplates).values({
    workspaceId: options.workspaceId,
    name: options.name,
    description: options.description,
    category: options.category,
    isPublic: options.isPublic ?? false,
    snapshot,
    createdBy: userId,
  }).returning({ id: formTemplates.id });

  return template;
}

// Create a form from a template
export async function createFormFromTemplate(
  templateId: string,
  workspaceId: string,
  userId: string
): Promise<{ formId: string }> {
  const template = await getTemplate(templateId);

  if (!template) {
    throw new Error("Template not found");
  }

  // Increment usage count
  await db.update(formTemplates)
    .set({ usageCount: sql`${formTemplates.usageCount} + 1` })
    .where(eq(formTemplates.id, templateId));

  // Create the form from snapshot
  const formId = await createFormFromSnapshot(
    workspaceId,
    userId,
    template.snapshot,
    `${template.name} (Copy)`
  );

  return { formId };
}

// Clone a form
export async function cloneForm(
  formId: string,
  workspaceId: string,
  userId: string,
  options?: {
    includeTheme?: boolean;
    includeLogic?: boolean;
    includeIntegrations?: boolean;
    newTitle?: string;
  }
): Promise<{ formId: string }> {
  const { includeTheme = true, newTitle } = options || {};

  const snapshot = await createFormSnapshot(formId);

  // Get original form for theme
  const originalForm = await db.query.forms.findFirst({
    where: eq(forms.id, formId),
  });

  const newFormId = await createFormFromSnapshot(
    workspaceId,
    userId,
    snapshot,
    newTitle || `${snapshot.title} (Copy)`,
    includeTheme ? originalForm?.themeId : undefined
  );

  return { formId: newFormId };
}

// Helper to create a form from a snapshot
async function createFormFromSnapshot(
  workspaceId: string,
  userId: string,
  snapshot: FormSnapshot,
  title: string,
  themeId?: string | null
): Promise<string> {
  // Generate a unique slug
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}-${nanoid(8)}`;

  // Create the form
  const [newForm] = await db.insert(forms).values({
    workspaceId,
    title,
    slug,
    description: snapshot.description,
    settings: snapshot.settings,
    themeId,
    createdBy: userId,
  }).returning({ id: forms.id });

  // Create questions
  for (const q of snapshot.questions) {
    const [newQuestion] = await db.insert(questions).values({
      formId: newForm.id,
      type: q.type as typeof questions.$inferInsert.type,
      title: q.title,
      description: q.description,
      required: q.required,
      order: q.order,
      settings: q.settings as typeof questions.$inferInsert.settings,
    }).returning({ id: questions.id });

    // Create options if any
    if (q.options && q.options.length > 0) {
      await db.insert(questionOptions).values(
        q.options.map((o) => ({
          questionId: newQuestion.id,
          label: o.value, // Use value as label if no separate label
          value: o.value,
          order: o.order,
        }))
      );
    }
  }

  return newForm.id;
}

// Update a template
export async function updateTemplate(
  templateId: string,
  updates: {
    name?: string;
    description?: string;
    category?: TemplateCategory;
    isPublic?: boolean;
    isFeatured?: boolean;
  }
): Promise<void> {
  await db.update(formTemplates)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(formTemplates.id, templateId));
}

// Delete a template
export async function deleteTemplate(templateId: string): Promise<void> {
  await db.delete(formTemplates).where(eq(formTemplates.id, templateId));
}

// Get template categories with counts
export async function getTemplateCategoryCounts(): Promise<
  Array<{ category: TemplateCategory; count: number }>
> {
  const result = await db
    .select({
      category: formTemplates.category,
      count: sql<number>`count(*)::int`,
    })
    .from(formTemplates)
    .where(eq(formTemplates.isPublic, true))
    .groupBy(formTemplates.category);

  return result.filter((r): r is { category: TemplateCategory; count: number } =>
    r.category !== null
  );
}

// Export form as JSON
export async function exportFormAsJson(formId: string): Promise<{
  version: string;
  exportedAt: string;
  form: FormSnapshot;
}> {
  const snapshot = await createFormSnapshot(formId);

  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    form: snapshot,
  };
}

// Import form from JSON
export async function importFormFromJson(
  workspaceId: string,
  userId: string,
  jsonData: {
    version: string;
    form: FormSnapshot;
  }
): Promise<{ formId: string }> {
  if (jsonData.version !== "1.0") {
    throw new Error("Unsupported export format version");
  }

  const formId = await createFormFromSnapshot(
    workspaceId,
    userId,
    jsonData.form,
    `${jsonData.form.title} (Imported)`
  );

  return { formId };
}
