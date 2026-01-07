import {
  EmailNotification,
  emailTemplates,
  interpolate,
  NewResponseEmailData,
  DailyDigestEmailData,
  WeeklyReportEmailData,
  TeamInviteEmailData,
  ResponseLimitWarningEmailData,
} from "./types";

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@example.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Simple email sending function (can be swapped for Resend/Nodemailer)
async function sendEmailInternal(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  // Check if we have email credentials configured
  if (process.env.RESEND_API_KEY) {
    // Use Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send email via Resend:", await response.text());
      return false;
    }
    return true;
  }

  // Fallback: log email for development
  console.log("[Email] Would send email:", { to, subject, html: html.slice(0, 200) });
  return true;
}

// Send an email notification
export async function sendEmail(notification: EmailNotification): Promise<boolean> {
  const template = emailTemplates[notification.type];
  const subject = notification.subject || interpolate(template.subject, notification.data);
  const html = await renderEmailTemplate(notification.type, notification.data);

  return sendEmailInternal(notification.to, subject, html);
}

// Render email templates (simple HTML - can be replaced with React Email)
async function renderEmailTemplate(
  type: string,
  data: Record<string, unknown>
): Promise<string> {
  switch (type) {
    case "new-response":
      return renderNewResponseEmail(data as unknown as NewResponseEmailData);
    case "daily-digest":
      return renderDailyDigestEmail(data as unknown as DailyDigestEmailData);
    case "weekly-report":
      return renderWeeklyReportEmail(data as unknown as WeeklyReportEmailData);
    case "team-invite":
      return renderTeamInviteEmail(data as unknown as TeamInviteEmailData);
    case "response-limit-warning":
      return renderResponseLimitWarningEmail(
        data as unknown as ResponseLimitWarningEmailData
      );
    default:
      return renderGenericEmail(data);
  }
}

// Base email template wrapper
function wrapEmail(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          border-bottom: 1px solid #eee;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #000;
        }
        .button {
          display: inline-block;
          background: #000;
          color: #fff !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          margin: 20px 0;
        }
        .footer {
          border-top: 1px solid #eee;
          padding-top: 20px;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
        .card {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }
        .muted {
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Typeform Clone</div>
      </div>
      ${content}
      <div class="footer">
        <p>This email was sent by Typeform Clone.</p>
        <p>If you didn't expect this email, you can safely ignore it.</p>
      </div>
    </body>
    </html>
  `;
}

// New response email
function renderNewResponseEmail(data: NewResponseEmailData): string {
  const answers = data.previewAnswers
    .slice(0, 3)
    .map(
      (a) => `
      <div class="card">
        <strong>${escapeHtml(a.question)}</strong>
        <p>${escapeHtml(a.value)}</p>
      </div>
    `
    )
    .join("");

  return wrapEmail(`
    <h1>New response to "${escapeHtml(data.formTitle)}"</h1>
    <p>You've received a new response. Here's a preview:</p>
    ${answers}
    <a href="${data.viewUrl}" class="button">View Full Response</a>
  `);
}

// Daily digest email
function renderDailyDigestEmail(data: DailyDigestEmailData): string {
  const forms = data.forms
    .map(
      (f) => `
      <div class="card">
        <strong>${escapeHtml(f.formTitle)}</strong>
        <p>${f.responseCount} new response${f.responseCount !== 1 ? "s" : ""}</p>
        <a href="${f.viewUrl}">View responses</a>
      </div>
    `
    )
    .join("");

  return wrapEmail(`
    <h1>Daily Digest for ${escapeHtml(data.date)}</h1>
    <p>Hi ${escapeHtml(data.userName)},</p>
    <p>Here's a summary of your form activity:</p>
    <p><strong>${data.responseCount}</strong> total new response${data.responseCount !== 1 ? "s" : ""}</p>
    ${forms}
    <a href="${data.dashboardUrl}" class="button">Go to Dashboard</a>
  `);
}

// Weekly report email
function renderWeeklyReportEmail(data: WeeklyReportEmailData): string {
  const forms = data.topForms
    .map(
      (f) => `
      <tr>
        <td>${escapeHtml(f.formTitle)}</td>
        <td>${f.responseCount}</td>
        <td>${f.completionRate}%</td>
      </tr>
    `
    )
    .join("");

  return wrapEmail(`
    <h1>Weekly Report</h1>
    <p>Hi ${escapeHtml(data.userName)},</p>
    <p>Here's your weekly summary for ${escapeHtml(data.weekStart)} - ${escapeHtml(data.weekEnd)}:</p>
    <p><strong>${data.totalResponses}</strong> total responses this week</p>

    <h3>Top Forms</h3>
    <table width="100%" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left;">Form</th>
          <th style="text-align: left;">Responses</th>
          <th style="text-align: left;">Completion Rate</th>
        </tr>
      </thead>
      <tbody>
        ${forms}
      </tbody>
    </table>

    <a href="${data.dashboardUrl}" class="button">View Full Report</a>
  `);
}

// Team invite email
function renderTeamInviteEmail(data: TeamInviteEmailData): string {
  return wrapEmail(`
    <h1>You've been invited!</h1>
    <p>${escapeHtml(data.inviterName)} (${escapeHtml(data.inviterEmail)}) has invited you to join <strong>${escapeHtml(data.workspaceName)}</strong> as a <strong>${escapeHtml(data.role)}</strong>.</p>
    <a href="${data.inviteUrl}" class="button">Accept Invitation</a>
    <p class="muted">This invitation expires on ${escapeHtml(data.expiresAt)}.</p>
  `);
}

// Response limit warning email
function renderResponseLimitWarningEmail(
  data: ResponseLimitWarningEmailData
): string {
  return wrapEmail(`
    <h1>Response Limit Warning</h1>
    <p>Your form <strong>"${escapeHtml(data.formTitle)}"</strong> is approaching its response limit.</p>
    <div class="card">
      <p><strong>${data.currentCount}</strong> of <strong>${data.maxCount}</strong> responses used (${data.percentageUsed}%)</p>
    </div>
    <p>Once the limit is reached, your form will stop accepting new responses.</p>
    <a href="${data.settingsUrl}" class="button">Update Settings</a>
  `);
}

// Generic fallback email
function renderGenericEmail(data: Record<string, unknown>): string {
  return wrapEmail(`
    <h1>${escapeHtml(String(data.title || "Notification"))}</h1>
    <p>${escapeHtml(String(data.message || ""))}</p>
    ${data.link ? `<a href="${data.link}" class="button">View Details</a>` : ""}
  `);
}

// HTML escape helper
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Export types
export * from "./types";
