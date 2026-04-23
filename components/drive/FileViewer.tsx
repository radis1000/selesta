"use client";

import { useEffect, useRef } from "react";
import { X, Download, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import type { FileRecord } from "@/types/api";

interface FileViewerProps {
  file: FileRecord | null;
  onClose: () => void;
  onDownload: (file: FileRecord) => void;
}

export function FileViewer({ file, onClose, onDownload }: FileViewerProps) {
  const t = useTranslations("drive.file");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!file) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [file, onClose]);

  if (!file) return null;

  const isImage = file.mimeType.startsWith("image/");
  const isVideo = file.mimeType.startsWith("video/");
  const isAudio = file.mimeType.startsWith("audio/");

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate text-white">{file.name}</p>
          <p className="text-xs text-white/50">{formatBytes(file.size)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onDownload(file)} className="text-white/70 hover:text-white hover:bg-white/10">
            <Download className="h-4 w-4" />
            {t("download")}
          </Button>
          <button onClick={onClose} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        {isImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/files/${file.id}/preview`}
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        )}
        {isVideo && (
          <video
            src={`/api/files/${file.id}/download`}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        )}
        {isAudio && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
              <FileText className="h-14 w-14 text-white/40" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">{file.name}</p>
              <p className="text-white/50 text-sm">{formatBytes(file.size)}</p>
            </div>
            <audio src={`/api/files/${file.id}/download`} controls autoPlay className="w-80" />
          </div>
        )}
        {!isImage && !isVideo && !isAudio && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center">
              <FileText className="h-12 w-12 text-white/40" />
            </div>
            <p className="text-white font-semibold">{file.name}</p>
            <p className="text-white/50 text-sm">Aperçu non disponible pour ce type de fichier.</p>
            <Button onClick={() => onDownload(file)} className="mt-2">
              <Download className="h-4 w-4" />
              {t("download")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
