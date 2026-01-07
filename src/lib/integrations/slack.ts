import { SlackConfig } from "@/lib/db/schema";

// Send Slack message
export async function sendSlackMessage(
  webhookUrl: string,
  message: {
    text: string;
    blocks?: Array<Record<string, unknown>>;
  }
) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Slack message failed: ${response.status}`);
  }

  return { success: true };
}

// Format response for Slack notification
export function formatResponseForSlack(
  formTitle: string,
  responseData: Record<string, unknown>,
  config: SlackConfig
): { text: string; blocks: Array<Record<string, unknown>> } {
  const timestamp = new Date().toISOString();

  const blocks: Array<Record<string, unknown>> = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `New Response: ${formTitle}`,
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Submitted at:* ${timestamp}`,
      },
    },
  ];

  if (config.includePreview) {
    const answers = Object.entries(responseData)
      .slice(0, 5) // Limit preview
      .map(([question, answer]) => `*${question}*\n${String(answer)}`)
      .join("\n\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: answers || "_No answers_",
      },
    });
  }

  blocks.push({
    type: "divider",
  });

  return {
    text: `New response to ${formTitle}`,
    blocks,
  };
}

// Get Slack channels (requires bot token)
export async function getSlackChannels(accessToken: string) {
  const response = await fetch(
    "https://slack.com/api/conversations.list?types=public_channel,private_channel",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Slack channels");
  }

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error || "Slack API error");
  }

  return data.channels.map((channel: { id: string; name: string }) => ({
    id: channel.id,
    name: channel.name,
  }));
}

// Post message to Slack channel
export async function postToSlackChannel(
  accessToken: string,
  channelId: string,
  message: { text: string; blocks?: Array<Record<string, unknown>> }
) {
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      channel: channelId,
      ...message,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error || "Failed to post message");
  }

  return { success: true, ts: data.ts };
}
