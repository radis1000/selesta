"use client";

import { X, CheckCircle, AlertCircle, Loader2, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUploadStore, type UploadingFile } from "@/store/uploadStore";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/format";

function FileUploadRow({ file }: { file: UploadingFile }) {
  const t = useTranslations("drive.upload");
  const { removeFile } = useUploadStore();
  const progress = file.totalChunks > 0 ? Math.round((file.uploadedChunks / file.totalChunks) * 100) : 0;

  const statusIcon = {
    idle: <Loader2 className="h-4 w-4 text-muted-foreground" />,
    chunking: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    uploading: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
    completing: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
    done: <CheckCircle className="h-4 w-4 text-emerald-400" />,
    error: <AlertCircle className="h-4 w-4 text-destructive" />,
  }[file.status];

  const statusLabel = file.status === "uploading"
    ? t("uploading", { uploaded: file.uploadedChunks, total: file.totalChunks })
    : t(file.status as "idle" | "chunking" | "completing" | "done" | "error");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{statusIcon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(file.size)} · {statusLabel}</p>
        </div>
        {(file.status === "done" || file.status === "error") && (
          <button onClick={() => removeFile(file.id)} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {file.status !== "done" && file.status !== "error" && <Progress value={progress} className="h-1" />}
      {file.status === "error" && file.error && <p className="text-xs text-destructive pl-7">{file.error}</p>}
    </div>
  );
}

export function UploadModal() {
  const t = useTranslations("drive.upload");
  const { files, isOpen, closeModal, clearCompleted } = useUploadStore();

  if (!isOpen || files.length === 0) return null;

  const hasCompleted = files.some((f) => f.status === "done" || f.status === "error");
  const activeCount = files.filter((f) => f.status !== "done" && f.status !== "error").length;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold">
          {activeCount > 0 ? t("titleActive", { count: activeCount }) : t("titleDone")}
        </p>
        <div className="flex items-center gap-1">
          {hasCompleted && (
            <button onClick={clearCompleted} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors cursor-pointer">
              {t("clear")}
            </button>
          )}
          <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded cursor-pointer">
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="px-4 py-3 space-y-4 max-h-72 overflow-y-auto">
        {files.map((file) => <FileUploadRow key={file.id} file={file} />)}
      </div>
    </div>
  );
}
