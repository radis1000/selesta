"use client";

import { useState } from "react";
import { LogOut, FolderOpen, Folder, HardDrive } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useWebhookStore } from "@/store/webhookStore";
import { formatBytes } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemePicker } from "./ThemePicker";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import type { FileRecord, FolderRecord } from "@/types/api";

interface SidebarProps {
  files: FileRecord[];
  folders: FolderRecord[];
  currentFolderId: string | null;
  storageLimit: number; // in bytes, 0 = unlimited
  onNavigate: (folderId: string | null) => void;
}

export function Sidebar({ files, folders, currentFolderId, storageLimit, onNavigate }: SidebarProps) {
  const router = useRouter();
  const t = useTranslations("drive.sidebar");
  const { clearWebhook } = useWebhookStore();
  const [limitInput, setLimitInput] = useState(storageLimit > 0 ? String(Math.round(storageLimit / 1e9)) : "");

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const totalChunks = files.reduce((acc, f) => acc + f.totalChunks, 0);
  const usagePercent = storageLimit > 0 ? Math.min(100, (totalSize / storageLimit) * 100) : 0;

  function handleDisconnect() {
    clearWebhook();
    router.push("/setup");
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col border-r border-border h-full overflow-y-auto">
      <button
        onClick={() => router.push("/setup")}
        className="flex items-center gap-3 px-4 h-14 border-b border-border flex-shrink-0 w-full hover:bg-accent/30 transition-colors cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="SplitCord" className="w-7 h-7 rounded-lg object-cover" />
        <span className="font-bold text-base tracking-tight">SplitCord</span>
      </button>

      {/* Workspace switcher */}
      <div className="px-2 pt-3 pb-1">
        <WorkspaceSwitcher />
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {/* Root */}
        <button
          onClick={() => onNavigate(null)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentFolderId === null ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
        >
          <HardDrive className="h-4 w-4" />{t("myDrive")}
        </button>

        {/* Folders */}
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onNavigate(folder.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${currentFolderId === folder.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
          >
            {currentFolderId === folder.id
              ? <FolderOpen className="h-4 w-4 text-amber-400" />
              : <Folder className="h-4 w-4 text-amber-400/70" />}
            <span className="truncate">{folder.name}</span>
            {folder._count && (
              <span className="ml-auto text-xs opacity-50">{folder._count.files}</span>
            )}
          </button>
        ))}
      </nav>

      <Separator />

      {/* Stats */}
      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("storage")}</span>
            <span className="font-medium">{formatBytes(totalSize)}</span>
          </div>
          {storageLimit > 0 && (
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("files")}</span>
            <span className="font-medium">{files.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("discordMessages")}</span>
            <span className="font-medium">{totalChunks}</span>
          </div>
        </div>

        {/* Storage limit config */}
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Limite (Go)</p>
          <input
            type="number"
            min="0"
            placeholder="Illimité"
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            onBlur={(e) => {
              const v = parseFloat(e.target.value);
              localStorage.setItem("splitcord-storage-limit", isNaN(v) ? "0" : String(v * 1e9));
            }}
            className="w-full text-xs px-2 py-1.5 rounded-lg bg-muted border border-border outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <Separator />

      {/* Theme + Language + Actions */}
      <div className="p-3 space-y-1">
        <ThemePicker />
        <LanguageSwitcher />
        <button
          onClick={handleDisconnect}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          {t("disconnect")}
        </button>
      </div>
    </aside>
  );
}
