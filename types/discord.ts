export interface DiscordAttachment {
  id: string;
  filename: string;
  size: number;
  url: string;
  proxy_url: string;
  content_type?: string;
}

export interface DiscordMessage {
  id: string;
  channel_id: string;
  attachments: DiscordAttachment[];
  timestamp: string;
}

export interface DiscordWebhookResponse {
  id: string;
  channel_id: string;
  attachments: DiscordAttachment[];
}
