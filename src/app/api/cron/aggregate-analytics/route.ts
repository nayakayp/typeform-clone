import { NextRequest, NextResponse } from "next/server";
import {
  aggregateAnalytics,
  getLastAggregationTime,
} from "@/lib/analytics/aggregation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds for aggregation

/**
 * Cron endpoint for aggregating analytics data.
 * Secured via CRON_SECRET environment variable.
 *
 * Called by Vercel Cron every 15 minutes.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET environment variable not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[Cron] Unauthorized access attempt to aggregate-analytics");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting analytics aggregation...");

    // Get the last aggregation time to avoid reprocessing
    const lastRun = await getLastAggregationTime();
    const sinceDate = lastRun
      ? new Date(lastRun.getTime() - 5 * 60 * 1000) // 5 min overlap for safety
      : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to last 24 hours

    console.log(`[Cron] Processing events since: ${sinceDate.toISOString()}`);

    // Run the aggregation
    const result = await aggregateAnalytics(sinceDate);

    const duration = Date.now() - startTime;

    // Log results
    console.log(`[Cron] Aggregation completed in ${duration}ms:`, {
      eventsProcessed: result.eventsProcessed,
      formDailyUpserts: result.formDailyUpserts,
      deviceUpserts: result.deviceUpserts,
      geoUpserts: result.geoUpserts,
      sourceUpserts: result.sourceUpserts,
      questionUpserts: result.questionUpserts,
      errors: result.errors.length > 0 ? result.errors : "none",
    });

    // Return appropriate response based on errors
    if (result.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          partial: true,
          ...result,
          durationMs: duration,
        },
        { status: 207 } // Multi-Status for partial success
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
      durationMs: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[Cron] Analytics aggregation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        durationMs: duration,
      },
      { status: 500 }
    );
  }
}
