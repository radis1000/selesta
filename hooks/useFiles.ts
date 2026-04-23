"use client";

import { useState, useEffect, useCallback } from "react";
import { useWebhookStore } from "@/store/webhookStore";
import { sha256File } from "@/lib/radis/checksum";
import type { FileRecord } from "@/types/api";

export type SortField = "name" | "size" | "createdAt";
export type SortOrder = "asc" | "desc";

interface FilesResponse {
  files: FileRecord[];
  total: number;
  page: number;
  limit: number;
}

export function useFiles(
  sortBy: SortField = "createdAt",
  sortOrder: SortOrder = "desc",
  folderId?: string | null
) {
  const { webhookId, webhookToken } = useWebhookStore();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!webhookId) return;
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({ webhookId, sortBy, sortOrder, limit: "200" });
      if (folderId !== undefined) params.set("folderId", folderId ?? "root");
      const res = await fetch(`/api/files?${params}`);
      if (!res.ok) throw new Error("Impossible de charger les fichiers");
      const data: FilesResponse = await res.json();
      setFiles(data.files);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [webhookId, sortBy, sortOrder, folderId]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const deleteFile = useCallback(async (id: string) => {
    const res = await fetch(`/api/files/${id}`, {
      method: "DELETE",
      headers: { "x-webhook-id": webhookId, "x-webhook-token": webhookToken },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Échec de la suppression");
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setTotal((prev) => prev - 1);
  }, [webhookId, webhookToken]);

  const deleteFiles = useCallback(async (ids: string[]) => {
    await Promise.allSettled(ids.map((id) => deleteFile(id)));
  }, [deleteFile]);

  const renameFile = useCallback(async (id: string, name: string) => {
    const res = await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-id": webhookId,
        "x-webhook-token": webhookToken,
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Échec du renommage");
    const data = await res.json();
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name: data.file.name } : f)));
  }, [webhookId, webhookToken]);

  const moveFile = useCallback(async (id: string, folderId: string | null) => {
    const res = await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-id": webhookId,
        "x-webhook-token": webhookToken,
      },
      body: JSON.stringify({ folderId }),
    });
    if (!res.ok) throw new Error("Échec du déplacement");
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, [webhookId, webhookToken]);

  const checkDuplicate = useCallback(async (file: File): Promise<FileRecord | null> => {
    const checksum = await sha256File(file);
    const res = await fetch(`/api/files/checksum?checksum=${checksum}&webhookId=${webhookId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.duplicate ?? null;
  }, [webhookId]);

  return {
    files, total, isLoading, error,
    refetch: fetchFiles,
    deleteFile, deleteFiles, renameFile, moveFile, checkDuplicate,
  };
}
