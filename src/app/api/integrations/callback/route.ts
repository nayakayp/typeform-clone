import { NextResponse } from "next/server";
import { decodeState, exchangeCodeForTokens } from "@/lib/integrations/oauth";
import { createWorkspaceIntegration, saveIntegrationTokens } from "@/lib/integrations";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/integrations/callback - OAuth callback handler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/integrations/error?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/integrations/error?error=missing_params", request.url)
      );
    }

    const { provider, formId, userId } = decodeState(state);

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(provider, code);

    // Get form's workspace
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
    });

    if (!form) {
      return NextResponse.redirect(
        new URL("/integrations/error?error=form_not_found", request.url)
      );
    }

    // Create workspace integration
    const integration = await createWorkspaceIntegration(
      form.workspaceId,
      provider as "google_sheets" | "slack" | "zapier" | "airtable" | "hubspot" | "mailchimp",
      { connected: true, connectedAt: new Date().toISOString() }
    );

    // Save tokens
    await saveIntegrationTokens(integration.id, tokens);

    // Redirect back to form integrations page
    return NextResponse.redirect(
      new URL(`/forms/${formId}/integrations?connected=${provider}`, request.url)
    );
  } catch (error) {
    console.error("OAuth callback failed:", error);
    return NextResponse.redirect(
      new URL("/integrations/error?error=callback_failed", request.url)
    );
  }
}
