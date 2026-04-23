"use client";

import { create } from "zustand";

export type DownloadStatus =
  | "fetching"
  | "downloading"
  | "verifying"
  | "done"
  | "error"
  | "checksum_mismatch";

export interface DownloadingFile {
  id: string;
  name: string;
  totalChunks: number;
  downloadedChunks: number;
  progress: number; // 0–100 (bytes-based)
  status: DownloadStatus;
  error?: string;
}

interface DownloadState {
  downloads: DownloadingFile[];
  addDownload: (file: Omit<DownloadingFile, "downloadedChunks" | "status" | "progress">) => void;
  updateProgress: (id: string, progress: number) => void;
  setStatus: (id: string, status: DownloadStatus, error?: string) => void;
  removeDownload: (id: string) => void;
}

export const useDownloadStore = create<DownloadState>((set) => ({
  downloads: [],
  addDownload: (file) =>
    set((state) => ({
      downloads: [
        ...state.downloads,
        { ...file, downloadedChunks: 0, progress: 0, status: "fetching" },
      ],
    })),
  updateProgress: (id, progress) =>
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id ? { ...d, progress, status: "downloading" } : d
      ),
    })),
  setStatus: (id, status, error) =>
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id ? { ...d, status, error } : d
      ),
    })),
  removeDownload: (id) =>
    set((state) => ({
      downloads: state.downloads.filter((d) => d.id !== id),
    })),
}));
