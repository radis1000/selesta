"use client";

import { useState, useEffect, useCallback } from "react";
import { useWebhookStore } from "@/store/webhookStore";
import type { FolderRecord } from "@/types/api";

export function useFolders() {
  const { webhookId, webhookToken } = useWebhookStore();
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFolders = useCallback(async () => {
    if (!webhookId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/folders?webhookId=${webhookId}`);
      if (res.ok) {
        const data = await res.json();
        setFolders(data.folders);
      }
    } finally {
      setIsLoading(false);
    }
  }, [webhookId]);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  const createFolder = useCallback(async (name: string) => {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, webhookId, webhookToken }),
    });
    if (!res.ok) throw new Error("Impossible de créer le dossier");
    const data = await res.json();
    setFolders((prev) => [...prev, data.folder]);
    return data.folder as FolderRecord;
  }, [webhookId, webhookToken]);

  const renameFolder = useCallback(async (id: string, name: string) => {
    const res = await fetch(`/api/folders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-id": webhookId,
        "x-webhook-token": webhookToken,
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Impossible de renommer");
    const data = await res.json();
    setFolders((prev) => prev.map((f) => (f.id === id ? data.folder : f)));
  }, [webhookId, webhookToken]);

  const deleteFolder = useCallback(async (id: string) => {
    const res = await fetch(`/api/folders/${id}`, {
      method: "DELETE",
      headers: { "x-webhook-id": webhookId, "x-webhook-token": webhookToken },
    });
    if (!res.ok) throw new Error("Impossible de supprimer");
    setFolders((prev) => prev.filter((f) => f.id !== id));
  }, [webhookId, webhookToken]);

  return { folders, isLoading, refetch: fetchFolders, createFolder, renameFolder, deleteFolder };
}
