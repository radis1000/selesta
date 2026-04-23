"use client";

import { Download, Trash2, MoreHorizontal, FileJson, Pencil, Share2, Eye, FolderInput, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatDateRelative, getFileIcon, getFileIconColor } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FileRecord, FolderRecord } from "@/types/api";

function downloadManifest(file: FileRecord) {
  const a = document.createElement("a");
  a.href = `/api/files/${file.id}/manifest`;
  a.download = `${file.name}.radis`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

interface FileRowProps {
  file: FileRecord;
  folders?: FolderRecord[];
  selected?: boolean;
  onSelect?: (id: string, multi: boolean) => void;
  onDownload: (file: FileRecord) => void;
  onDelete: (file: FileRecord) => void;
  onRename: (file: FileRecord) => void;
  onShare: (file: FileRecord) => void;
  onView: (file: FileRecord) => void;
  onMove?: (file: FileRecord, folderId: string | null) => void;
}

export function FileRow({ file, folders = [], selected, onSelect, onDownload, onDelete, onRename, onShare, onView, onMove }: FileRowProps) {
  const t = useTranslations("drive.file");
  const tList = useTranslations("drive.list");
  const Icon = getFileIcon(file.extension);
  const iconColor = getFileIconColor(file.extension);

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/api/files/${file.id}/download`);
    toast.success("Lien copié !");
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-100 cursor-pointer",
        selected ? "bg-primary/10" : "hover:bg-accent/30"
      )}
      onClick={(e) => onSelect?.(file.id, e.metaKey || e.ctrlKey || e.shiftKey)}
      onDoubleClick={() => onView(file)}
    >
      {onSelect && (
        <div className={cn(
          "flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
          selected ? "bg-primary border-primary" : "border-border opacity-0 group-hover:opacity-100"
        )}>
          {selected && <Check className="h-3 w-3 text-white" />}
        </div>
      )}
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
      </div>
      <div className="hidden sm:block flex-shrink-0">
        <Badge variant="muted" className="uppercase text-[10px] tracking-widest">{file.extension || "—"}</Badge>
      </div>
      <div className="hidden md:block flex-shrink-0 w-20 text-right">
        <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
      </div>
      <div className="hidden lg:block flex-shrink-0 w-20 text-right">
        <span className="text-xs text-muted-foreground">{file.totalChunks} {tList("chunks")}</span>
      </div>
      <div className="hidden sm:block flex-shrink-0 w-28 text-right">
        <span className="text-xs text-muted-foreground">{formatDateRelative(file.createdAt)}</span>
      </div>
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(file)}><Eye className="h-4 w-4" />{t("preview")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(file)}><Download className="h-4 w-4" />{t("download")}</DropdownMenuItem>
            <DropdownMenuItem onClick={copyLink}><FileJson className="h-4 w-4" />{t("copyLink")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { downloadManifest(file); toast.success(t("radisExported")); }}>
              <FileJson className="h-4 w-4" />{t("exportRadis")}
            </DropdownMenuItem>
            {onMove && folders.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger><FolderInput className="h-4 w-4" />{t("moveTo")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {file.folderId && <DropdownMenuItem onClick={() => onMove(file, null)}>Racine</DropdownMenuItem>}
                  {folders.filter((f) => f.id !== file.folderId).map((f) => (
                    <DropdownMenuItem key={f.id} onClick={() => onMove(file, f.id)}>{f.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            <DropdownMenuItem onClick={() => onRename(file)}><Pencil className="h-4 w-4" />{t("rename")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(file)}><Share2 className="h-4 w-4" />{t("share")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(file)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" />{t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
