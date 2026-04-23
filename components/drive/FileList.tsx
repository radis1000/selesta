"use client";

import { useTranslations } from "next-intl";
import { FileRow } from "./FileRow";
import type { FileRecord, FolderRecord } from "@/types/api";

interface FileListProps {
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

export function FileList({ files, folders, selectedIds, onSelect, onDownload, onDelete, onRename, onShare, onView, onMove }: FileListProps) {
  const t = useTranslations("drive.list");
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-2.5 bg-muted/30 border-b border-border">
        {onSelect && <div className="w-5" />}
        <div className="w-8" />
        <div className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("name")}</div>
        <div className="hidden sm:block w-16 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">{t("type")}</div>
        <div className="hidden md:block w-20 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">{t("size")}</div>
        <div className="hidden lg:block w-20 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">{t("chunks")}</div>
        <div className="hidden sm:block w-28 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">{t("date")}</div>
        <div className="w-8" />
      </div>
      <div className="divide-y divide-border/50">
        {files.map((file) => (
          <FileRow
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
    </div>
  );
}
