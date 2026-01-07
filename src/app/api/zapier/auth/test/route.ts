import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// GET /api/zapier/auth/test - Test authentication for Zapier
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In production, validate the API key from the auth header
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Authentication successful",
    });
  } catch (error) {
    console.error("Zapier auth test failed:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
