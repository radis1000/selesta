"use client";

import { Download, CheckCircle, AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDownloadStore } from "@/store/downloadStore";
import { Progress } from "@/components/ui/progress";

export function DownloadProgress() {
  const t = useTranslations("drive.download");
  const { downloads } = useDownloadStore();
  const visible = downloads.filter((d) => d.status !== "done" || d.progress === 100);
  if (visible.length === 0) return null;

  const STATUS_KEY_MAP: Record<string, string> = {
    fetching: "fetching",
    downloading: "downloading",
    verifying: "verifying",
    done: "done",
    error: "error",
    checksum_mismatch: "checksumMismatch",
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 space-y-2 max-w-xs w-full">
      {visible.map((dl) => (
        <div key={dl.id} className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            {dl.status === "done" ? <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              : dl.status === "error" ? <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              : dl.status === "checksum_mismatch" ? <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0" />
              : <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{dl.name}</p>
              <p className={`text-xs truncate ${dl.status === "checksum_mismatch" ? "text-amber-400" : dl.status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                {dl.error ?? t(STATUS_KEY_MAP[dl.status] as "fetching" | "downloading" | "verifying" | "done" | "error" | "checksumMismatch")}
              </p>
            </div>
            <Download className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
          {dl.status === "downloading" && dl.progress > 0 && (
            <div className="px-4 pb-3">
              <Progress value={dl.progress} className="h-1" />
              <p className="text-right text-[10px] text-muted-foreground mt-1">{dl.progress}%</p>
            </div>
          )}
          {dl.status === "verifying" && (
            <div className="px-4 pb-3"><Progress value={99} className="h-1 animate-pulse" /></div>
          )}
        </div>
      ))}
    </div>
  );
}
