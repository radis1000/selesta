"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace } from "@/types/api";

interface WebhookState {
  workspaces: Workspace[];
  activeId: string | null;
  // Computed shortcuts (active workspace fields)
  webhookUrl: string;
  webhookId: string;
  webhookToken: string;
  isConfigured: boolean;
  // Actions
  addWorkspace: (name: string, url: string, id: string, token: string) => void;
  switchWorkspace: (id: string) => void;
  removeWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  setWebhook: (url: string, id: string, token: string) => void; // legacy compat
  clearWebhook: () => void;
}

function deriveActive(workspaces: Workspace[], activeId: string | null) {
  const w = workspaces.find((ws) => ws.id === activeId) ?? null;
  return {
    webhookUrl: w?.webhookUrl ?? "",
    webhookId: w?.webhookId ?? "",
    webhookToken: w?.webhookToken ?? "",
    isConfigured: !!w,
  };
}

export const useWebhookStore = create<WebhookState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeId: null,
      webhookUrl: "",
      webhookId: "",
      webhookToken: "",
      isConfigured: false,

      addWorkspace: (name, url, id, token) => {
        const ws: Workspace = { id, name, webhookUrl: url, webhookId: id, webhookToken: token };
        const workspaces = [...get().workspaces.filter((w) => w.id !== id), ws];
        const activeId = id;
        set({ workspaces, activeId, ...deriveActive(workspaces, activeId) });
      },

      switchWorkspace: (id) => {
        const { workspaces } = get();
        set({ activeId: id, ...deriveActive(workspaces, id) });
      },

      removeWorkspace: (id) => {
        const workspaces = get().workspaces.filter((w) => w.id !== id);
        const activeId = get().activeId === id ? (workspaces[0]?.id ?? null) : get().activeId;
        set({ workspaces, activeId, ...deriveActive(workspaces, activeId) });
      },

      renameWorkspace: (id, name) => {
        const workspaces = get().workspaces.map((w) => (w.id === id ? { ...w, name } : w));
        set({ workspaces });
      },

      // Legacy: first webhook configured gets a default name
      setWebhook: (url, id, token) => {
        const existing = get().workspaces.find((w) => w.id === id);
        const name = existing?.name ?? `Workspace ${get().workspaces.length + 1}`;
        get().addWorkspace(name, url, id, token);
      },

      clearWebhook: () => {
        set({ workspaces: [], activeId: null, webhookUrl: "", webhookId: "", webhookToken: "", isConfigured: false });
      },
    }),
    { name: "splitcord-webhook" }
  )
);
