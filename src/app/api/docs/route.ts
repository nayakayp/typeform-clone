import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/api/openapi";

// GET /api/docs - Serve OpenAPI specification
export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      "Content-Type": "application/json",
      // Allow CORS for API documentation tools
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
