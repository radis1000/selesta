"use client";

import { useCallback } from "react";
import { useDownloadStore } from "@/store/downloadStore";
import { sha256Buffer } from "@/lib/radis/checksum";
import type { FileRecord } from "@/types/api";

export function useDownload() {
  const { addDownload, updateProgress, setStatus, removeDownload } =
    useDownloadStore();

  const downloadFile = useCallback(
    async (file: FileRecord) => {
      addDownload({
        id: file.id,
        name: file.name,
        totalChunks: file.totalChunks,
      });

      try {
        const res = await fetch(`/api/files/${file.id}/download`);

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Échec du téléchargement");
        }

        // Streaming avec suivi de progression bytes
        const contentLength = parseInt(
          res.headers.get("Content-Length") ?? "0",
          10
        );
        const reader = res.body?.getReader();
        if (!reader) throw new Error("Stream non disponible");

        const chunks: Uint8Array[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.byteLength;
          const progress =
            contentLength > 0
              ? Math.min(Math.round((received / contentLength) * 100), 99)
              : 50;
          updateProgress(file.id, progress);
        }

        // Reconstruction du fichier complet
        const totalSize = chunks.reduce((acc, c) => acc + c.byteLength, 0);
        const combined = new Uint8Array(totalSize);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.byteLength;
        }

        // Vérification checksum SHA-256
        setStatus(file.id, "verifying");
        const computedChecksum = await sha256Buffer(combined.buffer as ArrayBuffer);

        if (computedChecksum !== file.checksum) {
          setStatus(
            file.id,
            "checksum_mismatch",
            `Intégrité compromise : checksum attendu ${file.checksum.slice(0, 8)}… ≠ reçu ${computedChecksum.slice(0, 8)}…`
          );
          setTimeout(() => removeDownload(file.id), 8000);
          return;
        }

        // Déclenchement du téléchargement
        updateProgress(file.id, 100);
        setStatus(file.id, "done");

        const blob = new Blob([combined], {
          type: file.mimeType || "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setTimeout(() => removeDownload(file.id), 3000);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        setStatus(file.id, "error", message);
        setTimeout(() => removeDownload(file.id), 6000);
      }
    },
    [addDownload, updateProgress, setStatus, removeDownload]
  );

  return { downloadFile };
}
