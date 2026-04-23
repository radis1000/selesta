"use client";

import { create } from "zustand";

export type UploadStatus =
  | "idle"
  | "chunking"
  | "uploading"
  | "completing"
  | "done"
  | "error";

export interface UploadingFile {
  id: string;
  name: string;
  size: number;
  totalChunks: number;
  uploadedChunks: number;
  status: UploadStatus;
  error?: string;
  fileId?: string;
}

interface UploadState {
  files: UploadingFile[];
  isOpen: boolean;
  addFile: (file: Omit<UploadingFile, "uploadedChunks" | "status">) => void;
  updateChunkProgress: (id: string, uploadedChunks: number) => void;
  setStatus: (id: string, status: UploadStatus, error?: string) => void;
  setFileId: (id: string, fileId: string) => void;
  removeFile: (id: string) => void;
  clearCompleted: () => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  files: [],
  isOpen: false,
  addFile: (file) =>
    set((state) => ({
      files: [
        ...state.files,
        { ...file, uploadedChunks: 0, status: "idle" as UploadStatus },
      ],
      isOpen: true,
    })),
  updateChunkProgress: (id, uploadedChunks) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, uploadedChunks } : f
      ),
    })),
  setStatus: (id, status, error) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status, error } : f
      ),
    })),
  setFileId: (id, fileId) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, fileId } : f)),
    })),
  removeFile: (id) =>
    set((state) => ({ files: state.files.filter((f) => f.id !== id) })),
  clearCompleted: () =>
    set((state) => ({
      files: state.files.filter(
        (f) => f.status !== "done" && f.status !== "error"
      ),
    })),
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
