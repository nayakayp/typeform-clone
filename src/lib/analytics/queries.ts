import { db } from "@/lib/db";
import {
  formAnalyticsDaily,
  formDeviceAnalytics,
  formGeoAnalytics,
  formSourceAnalytics,
  questionAnalytics,
  answerDistribution,
  formViewEvents,
  formStats,
} from "@/lib/db/schema";
import { eq, and, gte, lte, desc, sql, sum, count, avg } from "drizzle-orm";

// Types
export interface DateRange {
  from: Date;
  to: Date;
}

export interface TrendData {
  date: string;
  value: number;
}

export interface FormAnalyticsOverview {
  totalViews: number;
  totalStarts: number;
  totalCompletions: number;
  completionRate: number;
  avgCompletionTime: number;
  viewsTrend: TrendData[];
  completionsTrend: TrendData[];
}

export interface DeviceBreakdown {
  deviceType: string;
  count: number;
  percentage: number;
}

export interface BrowserBreakdown {
  browser: string;
  count: number;
  percentage: number;
}

export interface CountryBreakdown {
  country: string;
  count: number;
  percentage: number;
}

export interface SourceBreakdown {
  source: string;
  medium: string | null;
  count: number;
  percentage: number;
}

export interface QuestionDropOff {
  questionId: string;
  title: string;
  order: number;
  reached: number;
  answered: number;
  droppedOff: number;
  dropOffRate: number;
  avgTimeSpent: number;
}

export interface OptionDistribution {
  optionValue: string;
  count: number;
  percentage: number;
}

export interface QuestionInsights {
  questionId: string;
  responseCount: number;
  skipRate: number;
  avgTimeSpent: number;
  optionDistribution?: OptionDistribution[];
  numericStats?: {
    min: number;
    max: number;
    avg: number;
    median: number;
  };
  ratingStats?: {
    avg: number;
    distribution: { rating: number; count: number }[];
    nps?: { promoters: number; passives: number; detractors: number; score: number };
  };
}

// Helper: Format date for SQL
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Get form analytics overview
export async function getFormAnalyticsOverview(
  formId: string,
  dateRange: DateRange
): Promise<FormAnalyticsOverview> {
  const fromDate = formatDate(dateRange.from);
  const toDate = formatDate(dateRange.to);

  // Get aggregated metrics
  const metrics = await db
    .select({
      totalViews: sum(formAnalyticsDaily.views),
      totalStarts: sum(formAnalyticsDaily.starts),
      totalCompletions: sum(formAnalyticsDaily.completions),
      totalCompletionTime: sum(formAnalyticsDaily.totalCompletionTime),
    })
    .from(formAnalyticsDaily)
    .where(
      and(
        eq(formAnalyticsDaily.formId, formId),
        gte(formAnalyticsDaily.date, fromDate),
        lte(formAnalyticsDaily.date, toDate)
      )
    );

  const totalViews = Number(metrics[0]?.totalViews) || 0;
  const totalStarts = Number(metrics[0]?.totalStarts) || 0;
  const totalCompletions = Number(metrics[0]?.totalCompletions) || 0;
  const totalCompletionTime = Number(metrics[0]?.totalCompletionTime) || 0;

  // Get trend data
  const trendData = await db
    .select({
      date: formAnalyticsDaily.date,
      views: formAnalyticsDaily.views,
      completions: formAnalyticsDaily.completions,
    })
    .from(formAnalyticsDaily)
    .where(
      and(
        eq(formAnalyticsDaily.formId, formId),
        gte(formAnalyticsDaily.date, fromDate),
        lte(formAnalyticsDaily.date, toDate)
      )
    )
    .orderBy(formAnalyticsDaily.date);

  return {
    totalViews,
    totalStarts,
    totalCompletions,
    completionRate: totalStarts > 0 ? (totalCompletions / totalStarts) * 100 : 0,
    avgCompletionTime:
      totalCompletions > 0 ? totalCompletionTime / totalCompletions : 0,
    viewsTrend: trendData.map((d) => ({ date: d.date, value: d.views })),
    completionsTrend: trendData.map((d) => ({
      date: d.date,
      value: d.completions,
    })),
  };
}

// Get device breakdown
export async function getDeviceBreakdown(
  formId: string,
  dateRange: DateRange
): Promise<DeviceBreakdown[]> {
  const fromDate = formatDate(dateRange.from);
  const toDate = formatDate(dateRange.to);

  const data = await db
    .select({
      deviceType: formDeviceAnalytics.deviceType,
      total: sum(formDeviceAnalytics.count),
    })
    .from(formDeviceAnalytics)
    .where(
      and(
        eq(formDeviceAnalytics.formId, formId),
        gte(formDeviceAnalytics.date, fromDate),
        lte(formDeviceAnalytics.date, toDate)
      )
    )
    .groupBy(formDeviceAnalytics.deviceType)
    .orderBy(desc(sum(formDeviceAnalytics.count)));

  const totalCount = data.reduce((sum, d) => sum + (Number(d.total) || 0), 0);

  return data.map((d) => ({
    deviceType: d.deviceType,
    count: Number(d.total) || 0,
    percentage: totalCount > 0 ? ((Number(d.total) || 0) / totalCount) * 100 : 0,
  }));
}

// Get browser breakdown
export async function getBrowserBreakdown(
  formId: string,
  dateRange: DateRange
): Promise<BrowserBreakdown[]> {
  const fromDate = formatDate(dateRange.from);
  const toDate = formatDate(dateRange.to);

  const data = await db
    .select({
      browser: formDeviceAnalytics.browser,
      total: sum(formDeviceAnalytics.count),
    })
    .from(formDeviceAnalytics)
    .where(
      and(
        eq(formDeviceAnalytics.formId, formId),
        gte(formDeviceAnalytics.date, fromDate),
        lte(formDeviceAnalytics.date, toDate)
      )
    )
    .groupBy(formDeviceAnalytics.browser)
    .orderBy(desc(sum(formDeviceAnalytics.count)));

  const totalCount = data.reduce((sum, d) => sum + (Number(d.total) || 0), 0);

  return data.map((d) => ({
    browser: d.browser || "Unknown",
    count: Number(d.total) || 0,
    percentage: totalCount > 0 ? ((Number(d.total) || 0) / totalCount) * 100 : 0,
  }));
}

// Get country breakdown
export async function getCountryBreakdown(
  formId: string,
  dateRange: DateRange
): Promise<CountryBreakdown[]> {
  const fromDate = formatDate(dateRange.from);
  const toDate = formatDate(dateRange.to);

  const data = await db
    .select({
      country: formGeoAnalytics.country,
      total: sum(formGeoAnalytics.count),
    })
    .from(formGeoAnalytics)
    .where(
      and(
        eq(formGeoAnalytics.formId, formId),
        gte(formGeoAnalytics.date, fromDate),
        lte(formGeoAnalytics.date, toDate)
      )
    )
    .groupBy(formGeoAnalytics.country)
    .orderBy(desc(sum(formGeoAnalytics.count)));

  const totalCount = data.reduce((sum, d) => sum + (Number(d.total) || 0), 0);

  return data.map((d) => ({
    country: d.country,
    count: Number(d.total) || 0,
    percentage: totalCount > 0 ? ((Number(d.total) || 0) / totalCount) * 100 : 0,
  }));
}

// Get source breakdown
export async function getSourceBreakdown(
  formId: string,
  dateRange: DateRange
): Promise<SourceBreakdown[]> {
  const fromDate = formatDate(dateRange.from);
  const toDate = formatDate(dateRange.to);

  const data = await db
    .select({
      source: formSourceAnalytics.source,
      medium: formSourceAnalytics.medium,
      total: sum(formSourceAnalytics.count),
    })
    .from(formSourceAnalytics)
    .where(
      and(
        eq(formSourceAnalytics.formId, formId),
        gte(formSourceAnalytics.date, fromDate),
        lte(formSourceAnalytics.date, toDate)
      )
    )
    .groupBy(formSourceAnalytics.source, formSourceAnalytics.medium)
    .orderBy(desc(sum(formSourceAnalytics.count)));

  const totalCount = data.reduce((sum, d) => sum + (Number(d.total) || 0), 0);

  return data.map((d) => ({
    source: d.source || "Direct",
    medium: d.medium,
    count: Number(d.total) || 0,
    percentage: totalCount > 0 ? ((Number(d.total) || 0) / totalCount) * 100 : 0,
  }));
}

// Get question drop-off analysis
export async function getDropOffAnalysis(
  formId: string,
  dateRange: DateRange
): Promise<QuestionDropOff[]> {
  const fromDate = formatDate(dateRange.from);
  const toDate = formatDate(dateRange.to);

  const data = await db
    .select({
      questionId: questionAnalytics.questionId,
      views: sum(questionAnalytics.views),
      answers: sum(questionAnalytics.answers),
      dropOffs: sum(questionAnalytics.dropOffs),
      totalTimeSpent: sum(questionAnalytics.totalTimeSpent),
    })
    .from(questionAnalytics)
    .where(
      and(
        eq(questionAnalytics.formId, formId),
        gte(questionAnalytics.date, fromDate),
        lte(questionAnalytics.date, toDate)
      )
    )
    .groupBy(questionAnalytics.questionId);

  // Get question details
  const questionsData = await db.query.questions.findMany({
    where: eq(sql`form_id`, formId),
    orderBy: (questions, { asc }) => [asc(questions.order)],
  });

  const questionMap = new Map(questionsData.map((q) => [q.id, q]));

  return data
    .map((d) => {
      const question = questionMap.get(d.questionId);
      const reached = Number(d.views) || 0;
      const answered = Number(d.answers) || 0;
      const droppedOff = Number(d.dropOffs) || 0;
      const totalTime = Number(d.totalTimeSpent) || 0;

      return {
        questionId: d.questionId,
        title: (question?.title as string) || "Unknown Question",
        order: question?.order || 0,
        reached,
        answered,
        droppedOff,
        dropOffRate: reached > 0 ? (droppedOff / reached) * 100 : 0,
        avgTimeSpent: answered > 0 ? totalTime / answered : 0,
      };
    })
    .sort((a, b) => a.order - b.order);
}

// Get question insights with answer distribution
export async function getQuestionInsights(
  questionId: string,
  formId: string,
  dateRange: DateRange
): Promise<QuestionInsights> {
  const fromDate = formatDate(dateRange.from);
  const toDate = formatDate(dateRange.to);

  // Get question analytics
  const analytics = await db
    .select({
      views: sum(questionAnalytics.views),
      answers: sum(questionAnalytics.answers),
      skips: sum(questionAnalytics.skips),
      totalTimeSpent: sum(questionAnalytics.totalTimeSpent),
    })
    .from(questionAnalytics)
    .where(
      and(
        eq(questionAnalytics.questionId, questionId),
        gte(questionAnalytics.date, fromDate),
        lte(questionAnalytics.date, toDate)
      )
    );

  const views = Number(analytics[0]?.views) || 0;
  const answers = Number(analytics[0]?.answers) || 0;
  const skips = Number(analytics[0]?.skips) || 0;
  const totalTimeSpent = Number(analytics[0]?.totalTimeSpent) || 0;

  // Get answer distribution
  const distribution = await db
    .select({
      optionValue: answerDistribution.optionValue,
      total: sum(answerDistribution.count),
    })
    .from(answerDistribution)
    .where(
      and(
        eq(answerDistribution.questionId, questionId),
        gte(answerDistribution.date, fromDate),
        lte(answerDistribution.date, toDate)
      )
    )
    .groupBy(answerDistribution.optionValue)
    .orderBy(desc(sum(answerDistribution.count)));

  const totalResponses = distribution.reduce(
    (sum, d) => sum + (Number(d.total) || 0),
    0
  );

  const optionDistribution = distribution.map((d) => ({
    optionValue: d.optionValue,
    count: Number(d.total) || 0,
    percentage:
      totalResponses > 0 ? ((Number(d.total) || 0) / totalResponses) * 100 : 0,
  }));

  return {
    questionId,
    responseCount: answers,
    skipRate: views > 0 ? (skips / views) * 100 : 0,
    avgTimeSpent: answers > 0 ? totalTimeSpent / answers : 0,
    optionDistribution:
      optionDistribution.length > 0 ? optionDistribution : undefined,
  };
}

// Get or create form stats
export async function getFormStats(formId: string) {
  let stats = await db.query.formStats.findFirst({
    where: eq(formStats.formId, formId),
  });

  if (!stats) {
    const [newStats] = await db
      .insert(formStats)
      .values({ formId })
      .returning();
    stats = newStats;
  }

  return stats;
}

// Update form stats (called after response submission)
export async function updateFormStats(
  formId: string,
  event: "view" | "start" | "complete",
  completionTime?: number
) {
  const stats = await getFormStats(formId);

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (event === "view") {
    updates.totalViews = stats.totalViews + 1;
  } else if (event === "start") {
    updates.totalStarts = stats.totalStarts + 1;
  } else if (event === "complete") {
    updates.totalCompletions = stats.totalCompletions + 1;
    if (completionTime && stats.totalCompletions > 0) {
      const currentTotal = (stats.avgCompletionTime || 0) * stats.totalCompletions;
      updates.avgCompletionTime = Math.round(
        (currentTotal + completionTime) / (stats.totalCompletions + 1)
      );
    } else if (completionTime) {
      updates.avgCompletionTime = completionTime;
    }
  }

  await db
    .update(formStats)
    .set(updates)
    .where(eq(formStats.id, stats.id));
}

// Track form event (for real-time analytics)
export async function trackFormEvent(
  formId: string,
  sessionId: string,
  eventType: "view" | "start" | "complete" | "drop_off" | "question_view" | "question_answer",
  metadata?: {
    visitorId?: string;
    questionId?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    country?: string;
    region?: string;
    city?: string;
    source?: string;
    medium?: string;
    campaign?: string;
    referrer?: string;
    timeSpent?: number;
  }
) {
  await db.insert(formViewEvents).values({
    formId,
    sessionId,
    visitorId: metadata?.visitorId,
    eventType,
    questionId: metadata?.questionId,
    metadata: {
      deviceType: metadata?.deviceType,
      browser: metadata?.browser,
      os: metadata?.os,
      country: metadata?.country,
      region: metadata?.region,
      city: metadata?.city,
      source: metadata?.source,
      medium: metadata?.medium,
      campaign: metadata?.campaign,
      referrer: metadata?.referrer,
      timeSpent: metadata?.timeSpent,
    },
  });

  // Update form stats for main events
  if (eventType === "view" || eventType === "start" || eventType === "complete") {
    await updateFormStats(
      formId,
      eventType,
      eventType === "complete" ? metadata?.timeSpent : undefined
    );
  }
}
