import { db } from "@/lib/db";
import {
  formViewEvents,
  formAnalyticsDaily,
  formDeviceAnalytics,
  formGeoAnalytics,
  formSourceAnalytics,
  questionAnalytics,
} from "@/lib/db/schema";
import { sql, gte, and, eq } from "drizzle-orm";

export interface AggregationResult {
  formDailyUpserts: number;
  deviceUpserts: number;
  geoUpserts: number;
  sourceUpserts: number;
  questionUpserts: number;
  eventsProcessed: number;
  errors: string[];
}

/**
 * Aggregate form view events into daily analytics tables.
 * Uses SQL GROUP BY for efficiency and ON CONFLICT DO UPDATE for upserts.
 *
 * @param sinceDate - Process events from this timestamp (defaults to 24 hours ago)
 */
export async function aggregateAnalytics(
  sinceDate?: Date
): Promise<AggregationResult> {
  const since = sinceDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
  const errors: string[] = [];

  let formDailyUpserts = 0;
  let deviceUpserts = 0;
  let geoUpserts = 0;
  let sourceUpserts = 0;
  let questionUpserts = 0;
  let eventsProcessed = 0;

  try {
    // Count events to process
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(formViewEvents)
      .where(gte(formViewEvents.createdAt, since));
    eventsProcessed = countResult[0]?.count || 0;

    if (eventsProcessed === 0) {
      return {
        formDailyUpserts,
        deviceUpserts,
        geoUpserts,
        sourceUpserts,
        questionUpserts,
        eventsProcessed,
        errors,
      };
    }

    // 1. Aggregate formAnalyticsDaily
    try {
      const dailyResult = await db.execute(sql`
        INSERT INTO form_analytics_daily (id, form_id, date, views, unique_views, starts, completions, total_completion_time, created_at, updated_at)
        SELECT
          gen_random_uuid(),
          form_id,
          DATE(created_at),
          COUNT(*) FILTER (WHERE event_type = 'view'),
          COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'view'),
          COUNT(*) FILTER (WHERE event_type = 'start'),
          COUNT(*) FILTER (WHERE event_type = 'complete'),
          COALESCE(SUM((metadata->>'timeSpent')::int) FILTER (WHERE event_type = 'complete'), 0),
          NOW(),
          NOW()
        FROM form_view_events
        WHERE created_at >= ${since}
        GROUP BY form_id, DATE(created_at)
        ON CONFLICT (form_id, date) DO UPDATE SET
          views = form_analytics_daily.views + EXCLUDED.views,
          unique_views = form_analytics_daily.unique_views + EXCLUDED.unique_views,
          starts = form_analytics_daily.starts + EXCLUDED.starts,
          completions = form_analytics_daily.completions + EXCLUDED.completions,
          total_completion_time = COALESCE(form_analytics_daily.total_completion_time, 0) + EXCLUDED.total_completion_time,
          avg_completion_time = CASE
            WHEN (form_analytics_daily.completions + EXCLUDED.completions) > 0
            THEN (COALESCE(form_analytics_daily.total_completion_time, 0) + EXCLUDED.total_completion_time) / (form_analytics_daily.completions + EXCLUDED.completions)
            ELSE NULL
          END,
          updated_at = NOW()
        RETURNING id
      `);
      formDailyUpserts = dailyResult.length;
    } catch (e) {
      errors.push(`formAnalyticsDaily: ${e instanceof Error ? e.message : String(e)}`);
    }

    // 2. Aggregate formDeviceAnalytics
    try {
      const deviceResult = await db.execute(sql`
        INSERT INTO form_device_analytics (id, form_id, date, device_type, browser, os, count, created_at)
        SELECT
          gen_random_uuid(),
          form_id,
          DATE(created_at),
          COALESCE(metadata->>'deviceType', 'unknown'),
          metadata->>'browser',
          metadata->>'os',
          COUNT(*),
          NOW()
        FROM form_view_events
        WHERE created_at >= ${since}
        GROUP BY form_id, DATE(created_at), metadata->>'deviceType', metadata->>'browser', metadata->>'os'
        ON CONFLICT (form_id, date, device_type, browser, os) DO UPDATE SET
          count = form_device_analytics.count + EXCLUDED.count
        RETURNING id
      `);
      deviceUpserts = deviceResult.length;
    } catch (e) {
      errors.push(`formDeviceAnalytics: ${e instanceof Error ? e.message : String(e)}`);
    }

    // 3. Aggregate formGeoAnalytics
    try {
      const geoResult = await db.execute(sql`
        INSERT INTO form_geo_analytics (id, form_id, date, country, region, city, count, created_at)
        SELECT
          gen_random_uuid(),
          form_id,
          DATE(created_at),
          COALESCE(metadata->>'country', 'XX'),
          metadata->>'region',
          metadata->>'city',
          COUNT(*),
          NOW()
        FROM form_view_events
        WHERE created_at >= ${since}
          AND metadata->>'country' IS NOT NULL
        GROUP BY form_id, DATE(created_at), metadata->>'country', metadata->>'region', metadata->>'city'
        ON CONFLICT (form_id, date, country, region, city) DO UPDATE SET
          count = form_geo_analytics.count + EXCLUDED.count
        RETURNING id
      `);
      geoUpserts = geoResult.length;
    } catch (e) {
      errors.push(`formGeoAnalytics: ${e instanceof Error ? e.message : String(e)}`);
    }

    // 4. Aggregate formSourceAnalytics
    try {
      const sourceResult = await db.execute(sql`
        INSERT INTO form_source_analytics (id, form_id, date, source, medium, campaign, count, created_at)
        SELECT
          gen_random_uuid(),
          form_id,
          DATE(created_at),
          metadata->>'source',
          metadata->>'medium',
          metadata->>'campaign',
          COUNT(*),
          NOW()
        FROM form_view_events
        WHERE created_at >= ${since}
        GROUP BY form_id, DATE(created_at), metadata->>'source', metadata->>'medium', metadata->>'campaign'
        ON CONFLICT (form_id, date, source, medium, campaign) DO UPDATE SET
          count = form_source_analytics.count + EXCLUDED.count
        RETURNING id
      `);
      sourceUpserts = sourceResult.length;
    } catch (e) {
      errors.push(`formSourceAnalytics: ${e instanceof Error ? e.message : String(e)}`);
    }

    // 5. Aggregate questionAnalytics
    try {
      const questionResult = await db.execute(sql`
        INSERT INTO question_analytics (id, question_id, form_id, date, views, answers, drop_offs, total_time_spent, created_at, updated_at)
        SELECT
          gen_random_uuid(),
          question_id,
          form_id,
          DATE(created_at),
          COUNT(*) FILTER (WHERE event_type = 'question_view'),
          COUNT(*) FILTER (WHERE event_type = 'question_answer'),
          COUNT(*) FILTER (WHERE event_type = 'drop_off'),
          COALESCE(SUM((metadata->>'timeSpent')::int), 0),
          NOW(),
          NOW()
        FROM form_view_events
        WHERE created_at >= ${since}
          AND question_id IS NOT NULL
        GROUP BY question_id, form_id, DATE(created_at)
        ON CONFLICT (question_id, date) DO UPDATE SET
          views = question_analytics.views + EXCLUDED.views,
          answers = question_analytics.answers + EXCLUDED.answers,
          drop_offs = question_analytics.drop_offs + EXCLUDED.drop_offs,
          total_time_spent = COALESCE(question_analytics.total_time_spent, 0) + EXCLUDED.total_time_spent,
          avg_time_spent = CASE
            WHEN (question_analytics.answers + EXCLUDED.answers) > 0
            THEN (COALESCE(question_analytics.total_time_spent, 0) + EXCLUDED.total_time_spent) / (question_analytics.answers + EXCLUDED.answers)
            ELSE NULL
          END,
          updated_at = NOW()
        RETURNING id
      `);
      questionUpserts = questionResult.length;
    } catch (e) {
      errors.push(`questionAnalytics: ${e instanceof Error ? e.message : String(e)}`);
    }
  } catch (e) {
    errors.push(`General error: ${e instanceof Error ? e.message : String(e)}`);
  }

  return {
    formDailyUpserts,
    deviceUpserts,
    geoUpserts,
    sourceUpserts,
    questionUpserts,
    eventsProcessed,
    errors,
  };
}

/**
 * Get the timestamp of the last successful aggregation run.
 * Uses the max updated_at from formAnalyticsDaily as a proxy.
 */
export async function getLastAggregationTime(): Promise<Date | null> {
  const result = await db
    .select({ maxUpdated: sql<Date>`MAX(updated_at)` })
    .from(formAnalyticsDaily);
  return result[0]?.maxUpdated || null;
}
