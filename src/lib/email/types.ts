// Email notification types and interfaces

export type EmailNotificationType =
  | "new_response"
  | "daily_digest"
  | "weekly_report"
  | "form_published"
  | "team_invite"
  | "response_limit_warning"
  | "form_closed"
  | "webhook_failed";

export interface EmailNotification {
  type: EmailNotificationType;
  to: string;
  subject?: string;
  data: Record<string, unknown>;
}

export interface EmailTemplate {
  subject: string;
  template: string;
}

// Email template definitions
export const emailTemplates: Record<EmailNotificationType, EmailTemplate> = {
  new_response: {
    subject: 'New response to "{{formTitle}}"',
    template: "new-response",
  },
  daily_digest: {
    subject: "Daily digest: {{responseCount}} new responses",
    template: "daily-digest",
  },
  weekly_report: {
    subject: "Weekly report for your forms",
    template: "weekly-report",
  },
  form_published: {
    subject: '"{{formTitle}}" is now live!',
    template: "form-published",
  },
  team_invite: {
    subject: "You've been invited to join {{workspaceName}}",
    template: "team-invite",
  },
  response_limit_warning: {
    subject: "{{formTitle}} is approaching its response limit",
    template: "response-limit-warning",
  },
  form_closed: {
    subject: '"{{formTitle}}" has been closed',
    template: "form-closed",
  },
  webhook_failed: {
    subject: "Webhook delivery failed for {{formTitle}}",
    template: "webhook-failed",
  },
};

// Interpolate template variables
export function interpolate(
  template: string,
  data: Record<string, unknown>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    return value !== undefined ? String(value) : match;
  });
}

// New response email data
export interface NewResponseEmailData {
  formTitle: string;
  formId: string;
  responseId: string;
  previewAnswers: Array<{
    questionId: string;
    question: string;
    value: string;
  }>;
  viewUrl: string;
}

// Daily digest email data
export interface DailyDigestEmailData {
  userName: string;
  date: string;
  responseCount: number;
  forms: Array<{
    formId: string;
    formTitle: string;
    responseCount: number;
    viewUrl: string;
  }>;
  dashboardUrl: string;
}

// Weekly report email data
export interface WeeklyReportEmailData {
  userName: string;
  weekStart: string;
  weekEnd: string;
  totalResponses: number;
  topForms: Array<{
    formId: string;
    formTitle: string;
    responseCount: number;
    completionRate: number;
  }>;
  dashboardUrl: string;
}

// Team invite email data
export interface TeamInviteEmailData {
  workspaceName: string;
  inviterName: string;
  inviterEmail: string;
  role: string;
  inviteUrl: string;
  expiresAt: string;
}

// Response limit warning email data
export interface ResponseLimitWarningEmailData {
  formTitle: string;
  formId: string;
  currentCount: number;
  maxCount: number;
  percentageUsed: number;
  settingsUrl: string;
}
