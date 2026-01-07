import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/access";

const accessSettingsSchema = z.object({
  isPublic: z.boolean().optional(),
  requireAuth: z.boolean().optional(),
  passwordProtection: z
    .object({
      enabled: z.boolean(),
      password: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
  responseLimit: z
    .object({
      maxResponses: z.number().min(1),
      closedMessage: z.string().optional(),
      showRemaining: z.boolean().optional(),
    })
    .optional(),
  schedule: z
    .object({
      openAt: z.string().optional(),
      closeAt: z.string().optional(),
      timezone: z.string().optional(),
      beforeOpenMessage: z.string().optional(),
      afterCloseMessage: z.string().optional(),
    })
    .optional(),
  singleResponse: z
    .object({
      enabled: z.boolean(),
      method: z.enum(["cookie", "ip", "email", "user"]),
      allowEdit: z.boolean().optional(),
    })
    .optional(),
  ipRestrictions: z
    .object({
      allowlist: z.array(z.string()).optional(),
      blocklist: z.array(z.string()).optional(),
      countryRestrictions: z
        .object({
          mode: z.enum(["allow", "block"]),
          countries: z.array(z.string()),
        })
        .optional(),
    })
    .optional(),
});

// GET /api/forms/[formId]/access - Get access settings
export async function GET(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const settings = (form.settings as { access?: Record<string, unknown> })
      ?.access || {};

    // Don't return password hash
    if (settings.passwordProtection) {
      const pp = settings.passwordProtection as Record<string, unknown>;
      delete pp.passwordHash;
      pp.hasPassword = true;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to get access settings:", error);
    return NextResponse.json(
      { error: "Failed to get access settings" },
      { status: 500 }
    );
  }
}

// PUT /api/forms/[formId]/access - Update access settings
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = await params;

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        workspace: true,
      },
    });

    if (!form || form.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = accessSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid settings", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const newSettings = { ...validation.data };

    // Handle password hashing
    if (newSettings.passwordProtection?.enabled && newSettings.passwordProtection.password) {
      const passwordHash = await hashPassword(newSettings.passwordProtection.password);
      (newSettings.passwordProtection as Record<string, unknown>).passwordHash = passwordHash;
      delete (newSettings.passwordProtection as Record<string, unknown>).password;
    } else if (newSettings.passwordProtection?.enabled) {
      // Keep existing password hash
      const existingSettings = (form.settings as { access?: Record<string, unknown> })?.access;
      if (existingSettings?.passwordProtection) {
        const existing = existingSettings.passwordProtection as Record<string, unknown>;
        (newSettings.passwordProtection as Record<string, unknown>).passwordHash =
          existing.passwordHash;
      }
    }

    // Merge with existing settings
    const currentSettings = (form.settings as Record<string, unknown>) || {};
    const updatedSettings = {
      ...currentSettings,
      access: newSettings,
    };

    await db
      .update(forms)
      .set({ settings: updatedSettings })
      .where(eq(forms.id, formId));

    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error("Failed to update access settings:", error);
    return NextResponse.json(
      { error: "Failed to update access settings" },
      { status: 500 }
    );
  }
}
