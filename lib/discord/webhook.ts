import type { DiscordWebhookResponse } from "@/types/discord";

const DISCORD_API = "https://discord.com/api/v10";

export async function sendChunk(
  webhookId: string,
  webhookToken: string,
  chunkData: ArrayBuffer,
  chunkIndex: number,
  fileName: string
): Promise<{ messageId: string }> {
  const formData = new FormData();

  const blob = new Blob([new Uint8Array(chunkData)], { type: "application/octet-stream" });
  formData.append(
    "files[0]",
    blob,
    `${fileName}.part${String(chunkIndex).padStart(4, "0")}`
  );

  formData.append(
    "payload_json",
    JSON.stringify({
      content: `chunk:${chunkIndex}`,
    })
  );

  const res = await fetch(
    `${DISCORD_API}/webhooks/${webhookId}/${webhookToken}?wait=true`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Discord webhook error ${res.status}: ${error}`);
  }

  const data: DiscordWebhookResponse = await res.json();
  return { messageId: data.id };
}

export async function validateWebhook(
  webhookId: string,
  webhookToken: string
): Promise<{ channelId: string; guildId?: string }> {
  const res = await fetch(
    `${DISCORD_API}/webhooks/${webhookId}/${webhookToken}`
  );

  if (!res.ok) {
    throw new Error(`Invalid webhook: HTTP ${res.status}`);
  }

  const data = await res.json();
  return { channelId: data.channel_id, guildId: data.guild_id };
}

export async function deleteMessage(
  webhookId: string,
  webhookToken: string,
  messageId: string
): Promise<void> {
  const res = await fetch(
    `${DISCORD_API}/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
    { method: "DELETE" }
  );

  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete Discord message: HTTP ${res.status}`);
  }
}
