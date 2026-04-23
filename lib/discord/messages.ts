import type { DiscordMessage } from "@/types/discord";

const DISCORD_API = "https://discord.com/api/v10";

export async function fetchMessage(
  webhookId: string,
  webhookToken: string,
  messageId: string
): Promise<DiscordMessage> {
  const res = await fetch(
    `${DISCORD_API}/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Discord message ${messageId}: HTTP ${res.status}`
    );
  }

  return res.json();
}

export async function extractAttachmentUrl(
  webhookId: string,
  webhookToken: string,
  messageId: string
): Promise<string> {
  const message = await fetchMessage(webhookId, webhookToken, messageId);

  if (!message.attachments || message.attachments.length === 0) {
    throw new Error(`No attachments found in message ${messageId}`);
  }

  return message.attachments[0].url;
}

export async function downloadAttachment(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to download attachment: HTTP ${res.status}`);
  }

  return res.arrayBuffer();
}
