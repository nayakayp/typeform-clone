import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getOAuthUrl } from "@/lib/integrations/oauth";

// GET /api/integrations/oauth/[provider] - Initiate OAuth flow
export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await params;
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("formId");

    if (!formId) {
      return NextResponse.json({ error: "formId is required" }, { status: 400 });
    }

    const authUrl = getOAuthUrl(provider, formId, session.user.id);

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("OAuth initiation failed:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth" },
      { status: 500 }
    );
  }
}
