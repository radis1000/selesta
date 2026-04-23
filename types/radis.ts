export interface RadisChunk {
  index: number;
  size: number;
  messageId: string;
  checksum: string;
}

export interface RadisManifest {
  version: "1.0";
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  checksum: string;
  createdAt: string;
  webhookId: string;
  webhookToken: string;
  chunks: RadisChunk[];
}
