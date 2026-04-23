export interface UploadChunkRequest {
  chunk: Blob;
  index: number;
  webhookUrl: string;
  fileName: string;
  totalChunks: number;
}

export interface UploadChunkResponse {
  messageId: string;
  index: number;
}

export interface UploadCompleteRequest {
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  checksum: string;
  webhookId: string;
  webhookToken: string;
  totalChunks: number;
  folderId?: string | null;
  chunks: Array<{
    index: number;
    size: number;
    messageId: string;
    checksum: string;
  }>;
}

export interface UploadCompleteResponse {
  fileId: string;
}

export interface FileRecord {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  checksum: string;
  totalChunks: number;
  folderId: string | null;
  createdAt: string;
}

export interface FolderRecord {
  id: string;
  name: string;
  webhookId: string;
  createdAt: string;
  _count?: { files: number };
}

export interface ShareInfo {
  token: string;
  expiresAt: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  webhookUrl: string;
  webhookId: string;
  webhookToken: string;
}

export interface ValidateWebhookRequest {
  webhookUrl: string;
}

export interface ValidateWebhookResponse {
  valid: boolean;
  webhookId?: string;
  webhookToken?: string;
  channelId?: string;
  error?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
