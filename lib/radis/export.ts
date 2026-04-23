import type { FileRecord } from "@/types/api";

export async function exportRadisManifest(file: FileRecord): Promise<void> {
  const res = await fetch(`/api/files/${file.id}`);
  if (!res.ok) throw new Error("Impossible de récupérer le manifeste");
  const data = await res.json();

  const manifest = {
    version: "1.0",
    name: data.name,
    extension: data.extension,
    mimeType: data.mimeType,
    size: data.size,
    checksum: data.checksum,
    createdAt: data.createdAt,
    webhookId: data.webhookId,
    webhookToken: data.webhookToken,
    chunks: data.chunks.map((c: { index: number; size: number; messageId: string; checksum: string }) => ({
      index: c.index,
      size: c.size,
      messageId: c.messageId,
      checksum: c.checksum,
    })),
  };

  const json = JSON.stringify(manifest, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${file.name}.radis`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
