import type { RadisManifest, RadisChunk } from "@/types/radis";

export function buildManifest(params: {
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  checksum: string;
  webhookId: string;
  webhookToken: string;
  chunks: RadisChunk[];
}): RadisManifest {
  return {
    version: "1.0",
    name: params.name,
    extension: params.extension,
    mimeType: params.mimeType,
    size: params.size,
    checksum: params.checksum,
    createdAt: new Date().toISOString(),
    webhookId: params.webhookId,
    webhookToken: params.webhookToken,
    chunks: params.chunks.sort((a, b) => a.index - b.index),
  };
}

export function serializeManifest(manifest: RadisManifest): string {
  return JSON.stringify(manifest, null, 2);
}

export function parseManifest(raw: string): RadisManifest {
  const parsed = JSON.parse(raw);
  if (parsed.version !== "1.0") {
    throw new Error(`Unsupported .radis version: ${parsed.version}`);
  }
  return parsed as RadisManifest;
}

export function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}
