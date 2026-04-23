export const CHUNK_SIZE = 7.5 * 1024 * 1024; // 7.5 MB

export interface FileChunk {
  index: number;
  data: ArrayBuffer;
  size: number;
}

export async function splitFileIntoChunks(file: File): Promise<FileChunk[]> {
  const chunks: FileChunk[] = [];
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const blob = file.slice(start, end);
    const data = await blob.arrayBuffer();
    chunks.push({ index: i, data, size: data.byteLength });
  }

  return chunks;
}

export function getTotalChunks(fileSize: number): number {
  return Math.ceil(fileSize / CHUNK_SIZE);
}
