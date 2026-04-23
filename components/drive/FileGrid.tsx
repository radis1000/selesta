"use client";

import { FileCard } from "./FileCard";
import type { FileRecord, FolderRecord } from "@/types/api";

interface FileGridProps {
  files: FileRecord[];
  folders?: FolderRecord[];
  selectedIds?: Set<string>;
  onSelect?: (id: string, multi: boolean) => void;
  onDownload: (file: FileRecord) => void;
  onDelete: (file: FileRecord) => void;
  onRename: (file: FileRecord) => void;
  onShare: (file: FileRecord) => void;
  onView: (file: FileRecord) => void;
  onMove?: (file: FileRecord, folderId: string | null) => void;
}

export function FileGrid({ files, folders, selectedIds, onSelect, onDownload, onDelete, onRename, onShare, onView, onMove }: FileGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          folders={folders}
          selected={selectedIds?.has(file.id)}
          onSelect={onSelect}
          onDownload={onDownload}
          onDelete={onDelete}
          onRename={onRename}
          onShare={onShare}
          onView={onView}
          onMove={onMove}
        />
      ))}
    </div>
  );
}
