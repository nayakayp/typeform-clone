import { db } from "@/lib/db";
import { formViews, responses, forms, answers as answersTable } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, count } from "drizzle-orm";

export interface FormStats {
  totalViews: number;
  uniqueViews: number;
  totalResponses: number;
  completionRate: number;
  averageCompletionTime: number; // in seconds
}

export interface QuestionAnalytics {
  questionId: string;
  questionType: string;
  responseCount: number;
  distribution?: Record<string, number>; // For multiple choice
  average?: number; // For ratings/numbers
  min?: number;
  max?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Track a form view event
 */
export async function trackFormView(
  formId: string,
  metadata: {
    visitorId: string;
    userAgent?: string;
    referrer?: string;
    ip?: string;
  }
): Promise<void> {
  // Check for existing view from this visitor in the last 24 hours to deduplicate
  const existingView = await db
    .select()
    .from(formViews)
    .where(
      and(
        eq(formViews.formId, formId),
        eq(formViews.visitorId, metadata.visitorId),
        gte(formViews.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
      )
    )
    .limit(1);

  if (existingView.length > 0) {
    // Already viewed recently, don't count again
    return;
  }

  await db.insert(formViews).values({
    formId,
    visitorId: metadata.visitorId,
    userAgent: metadata.userAgent,
    referrer: metadata.referrer,
    ipAddress: metadata.ip,
  });
}

/**
 * Get overall form statistics
 */
export async function getFormStats(
  formId: string,
  dateRange?: DateRange
): Promise<FormStats> {
  const dateFilter = dateRange
    ? and(
        gte(formViews.createdAt, dateRange.start),
        lte(formViews.createdAt, dateRange.end)
      )
    : undefined;

  // Get total views
  const viewsResult = await db
    .select({ count: count() })
    .from(formViews)
    .where(dateFilter ? and(eq(formViews.formId, formId), dateFilter) : eq(formViews.formId, formId));

  const totalViews = viewsResult[0]?.count ?? 0;

  // Get unique views (by visitor)
  const uniqueViewsResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${formViews.visitorId})` })
    .from(formViews)
    .where(dateFilter ? and(eq(formViews.formId, formId), dateFilter) : eq(formViews.formId, formId));

  const uniqueViews = uniqueViewsResult[0]?.count ?? 0;

  // Get response stats
  const responseDateFilter = dateRange
    ? and(
        gte(responses.completedAt, dateRange.start),
        lte(responses.completedAt, dateRange.end)
      )
    : undefined;

  const responsesResult = await db
    .select({
      total: count(),
      avgTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${responses.completedAt} - ${responses.startedAt})))`,
    })
    .from(responses)
    .where(
      responseDateFilter
        ? and(eq(responses.formId, formId), responseDateFilter)
        : eq(responses.formId, formId)
    );

  const totalResponses = responsesResult[0]?.total ?? 0;
  const averageCompletionTime = responsesResult[0]?.avgTime ?? 0;

  // Calculate completion rate (responses / unique views)
  const completionRate = uniqueViews > 0 ? totalResponses / uniqueViews : 0;

  return {
    totalViews,
    uniqueViews,
    totalResponses,
    completionRate,
    averageCompletionTime: Math.round(averageCompletionTime),
  };
}

/**
 * Calculate completion rate for a form
 */
export async function calculateCompletionRate(
  formId: string,
  dateRange?: DateRange
): Promise<number> {
  const stats = await getFormStats(formId, dateRange);
  return stats.completionRate;
}

/**
 * Get analytics for a specific question
 */
export async function getQuestionAnalytics(
  questionId: string,
  questionType?: string
): Promise<QuestionAnalytics> {
  // Get all answers for this question
  const answerResults = await db
    .select()
    .from(answersTable)
    .where(eq(answersTable.questionId, questionId));

  const responseCount = answerResults.length;
  const analytics: QuestionAnalytics = {
    questionId,
    questionType: questionType ?? "unknown",
    responseCount,
  };

  if (responseCount === 0) {
    return analytics;
  }

  // Calculate type-specific analytics
  const type = questionType?.toLowerCase() ?? "";

  if (type.includes("choice") || type.includes("select") || type.includes("dropdown")) {
    // Multiple choice - calculate distribution
    const distribution: Record<string, number> = {};

    for (const answer of answerResults) {
      // Use jsonValue for arrays or textValue for single selections
      const jsonVal = answer.jsonValue as string[] | undefined;
      const options = jsonVal ?? (answer.textValue ? [answer.textValue] : []);

      for (const option of options) {
        distribution[option] = (distribution[option] || 0) + 1;
      }
    }

    analytics.distribution = distribution;
  } else if (type.includes("rating") || type.includes("opinion") || type.includes("nps")) {
    // Rating - calculate average
    const ratings: number[] = [];

    for (const answer of answerResults) {
      const numValue = answer.numberValue ? parseFloat(answer.numberValue) : undefined;
      if (numValue !== undefined && !isNaN(numValue)) {
        ratings.push(numValue);
      }
    }

    if (ratings.length > 0) {
      analytics.average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      analytics.min = Math.min(...ratings);
      analytics.max = Math.max(...ratings);
    }
  } else if (type.includes("number")) {
    // Number - calculate statistics
    const numbers: number[] = [];

    for (const answer of answerResults) {
      const numValue = answer.numberValue ? parseFloat(answer.numberValue) : undefined;
      if (numValue !== undefined && !isNaN(numValue)) {
        numbers.push(numValue);
      }
    }

    if (numbers.length > 0) {
      analytics.average = numbers.reduce((a, b) => a + b, 0) / numbers.length;
      analytics.min = Math.min(...numbers);
      analytics.max = Math.max(...numbers);
    }
  }

  return analytics;
}

/**
 * Get response trend over time
 */
export async function getResponseTrend(
  formId: string,
  dateRange: DateRange,
  granularity: "day" | "week" | "month" = "day"
): Promise<Array<{ date: string; count: number }>> {
  const dateFormat =
    granularity === "day"
      ? "YYYY-MM-DD"
      : granularity === "week"
        ? "YYYY-IW"
        : "YYYY-MM";

  const results = await db
    .select({
      date: sql<string>`TO_CHAR(${responses.completedAt}, ${dateFormat})`,
      count: count(),
    })
    .from(responses)
    .where(
      and(
        eq(responses.formId, formId),
        gte(responses.completedAt, dateRange.start),
        lte(responses.completedAt, dateRange.end)
      )
    )
    .groupBy(sql`TO_CHAR(${responses.completedAt}, ${dateFormat})`)
    .orderBy(sql`TO_CHAR(${responses.completedAt}, ${dateFormat})`);

  return results.map((r) => ({
    date: r.date,
    count: r.count,
  }));
}

/**
 * Get drop-off analysis (which questions have the most abandonment)
 */
export async function getDropOffAnalysis(formId: string): Promise<
  Array<{
    questionId: string;
    questionOrder: number;
    reachedCount: number;
    completedCount: number;
    dropOffRate: number;
  }>
> {
  // This is a simplified implementation
  // In production, you'd track question-level progress events

  const form = await db.select().from(forms).where(eq(forms.id, formId)).limit(1);

  if (!form[0]) {
    return [];
  }

  // For now, return empty array as full implementation requires question-level tracking
  return [];
}

/**
 * Get geographic distribution of responses
 */
export async function getGeographicDistribution(
  formId: string
): Promise<Record<string, number>> {
  const results = await db
    .select({
      country: sql<string>`COALESCE(${responses.country}, 'Unknown')`,
      count: count(),
    })
    .from(responses)
    .where(eq(responses.formId, formId))
    .groupBy(responses.country);

  const distribution: Record<string, number> = {};
  for (const result of results) {
    distribution[result.country] = result.count;
  }

  return distribution;
}

/**
 * Get device distribution of responses
 */
export async function getDeviceDistribution(
  formId: string
): Promise<Record<string, number>> {
  const results = await db
    .select({
      device: sql<string>`COALESCE(${responses.device}, 'Unknown')`,
      count: count(),
    })
    .from(responses)
    .where(eq(responses.formId, formId))
    .groupBy(responses.device);

  const distribution: Record<string, number> = {};
  for (const result of results) {
    distribution[result.device] = result.count;
  }

  return distribution;
}
