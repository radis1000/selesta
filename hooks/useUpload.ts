"use client";

import { useCallback } from "react";
import { useUploadStore } from "@/store/uploadStore";
import { useWebhookStore } from "@/store/webhookStore";
import { splitFileIntoChunks } from "@/lib/chunker";
import { sha256Buffer, sha256File } from "@/lib/radis/checksum";
import { getExtension } from "@/lib/radis/manifest";
import { sleep, retryWithBackoff, ConcurrentQueue } from "@/lib/rateLimit";
import type { UploadCompleteRequest } from "@/types/api";

const RATE_LIMIT_MS = 1000;
const MAX_CHUNK_RETRIES = 3;
// 2 fichiers en parallèle max — raisonnable sans saturer le webhook
const fileQueue = new ConcurrentQueue(2);

export function useUpload(onSuccess?: () => void, folderId?: string | null) {
  const { webhookUrl, webhookId, webhookToken } = useWebhookStore();
  const { addFile, updateChunkProgress, setStatus, setFileId } =
    useUploadStore();

  const uploadFile = useCallback(
    async (file: File) => {
      return fileQueue.run(async () => {
        const uploadId = `${Date.now()}-${Math.random()}`;
        const extension = getExtension(file.name);

        addFile({
          id: uploadId,
          name: file.name,
          size: file.size,
          totalChunks: Math.ceil(file.size / (7.5 * 1024 * 1024)),
        });

        try {
          setStatus(uploadId, "chunking");
          const chunks = await splitFileIntoChunks(file);
          const fileChecksum = await sha256File(file);

          setStatus(uploadId, "uploading");

          const chunkResults: Array<{
            index: number;
            size: number;
            messageId: string;
            checksum: string;
          }> = [];

          for (let i = 0; i < chunks.length; i++) {
            // Rate limit entre chaque chunk (1s minimum)
            if (i > 0) await sleep(RATE_LIMIT_MS);

            const chunk = chunks[i];
            const chunkChecksum = await sha256Buffer(chunk.data);

            // Retry avec backoff exponentiel sur chaque chunk
            const { messageId } = await retryWithBackoff(
              async () => {
                const formData = new FormData();
                formData.append(
                  "chunk",
                  new Blob([chunk.data], { type: "application/octet-stream" })
                );
                formData.append("index", String(chunk.index));
                formData.append("webhookUrl", webhookUrl);
                formData.append("fileName", file.name);
                formData.append("totalChunks", String(chunks.length));

                const res = await fetch("/api/upload/chunk", {
                  method: "POST",
                  body: formData,
                });

                if (!res.ok) {
                  const data = await res.json().catch(() => ({}));
                  throw new Error(data.error || `HTTP ${res.status}`);
                }

                return res.json();
              },
              MAX_CHUNK_RETRIES,
              RATE_LIMIT_MS
            );

            chunkResults.push({
              index: chunk.index,
              size: chunk.size,
              messageId,
              checksum: chunkChecksum,
            });

            updateChunkProgress(uploadId, i + 1);
          }

          setStatus(uploadId, "completing");

          const completePayload: UploadCompleteRequest = {
            name: file.name,
            extension,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            checksum: fileChecksum,
            webhookId,
            webhookToken,
            totalChunks: chunks.length,
            folderId: folderId ?? null,
            chunks: chunkResults,
          };

          const completeRes = await retryWithBackoff(async () => {
            const res = await fetch("/api/upload/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(completePayload),
            });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error || `HTTP ${res.status}`);
            }
            return res.json();
          }, 2);

          setFileId(uploadId, completeRes.fileId);
          setStatus(uploadId, "done");
          onSuccess?.();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Erreur inconnue";
          setStatus(uploadId, "error", message);
        }
      });
    },
    [webhookUrl, webhookId, webhookToken, folderId, addFile, updateChunkProgress, setStatus, setFileId, onSuccess]
  );

  const uploadFiles = useCallback(
    (files: File[]) => {
      // Lance tous les uploads — la ConcurrentQueue limite à 2 en parallèle
      return Promise.allSettled(files.map((file) => uploadFile(file)));
    },
    [uploadFile]
  );

  return { uploadFile, uploadFiles };
}
