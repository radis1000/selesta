export async function sha256Buffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256File(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return sha256Buffer(buffer);
}

export async function sha256Chunks(chunks: ArrayBuffer[]): Promise<string> {
  const totalSize = chunks.reduce((acc, c) => acc + c.byteLength, 0);
  const combined = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }
  return sha256Buffer(combined.buffer);
}
