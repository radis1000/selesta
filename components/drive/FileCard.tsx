"use client";

import { Download, Trash2, MoreHorizontal, FileJson, Pencil, Share2, Eye, FolderInput, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
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

interface FileCardProps {
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

export function FileCard({ file, folders = [], selected, onSelect, onDownload, onDelete, onRename, onShare, onView, onMove }: FileCardProps) {
  const t = useTranslations("drive.file");
  const Icon = getFileIcon(file.extension);
  const iconColor = getFileIconColor(file.extension);
  const isImage = file.mimeType.startsWith("image/");

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/api/files/${file.id}/download`);
    toast.success("Lien copié !");
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card hover:border-primary/30 hover:bg-accent/30 transition-all duration-150 overflow-hidden cursor-pointer",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border"
      )}
      onClick={(e) => onSelect?.(file.id, e.metaKey || e.ctrlKey || e.shiftKey)}
      onDoubleClick={() => onView(file)}
    >
      {/* Selection checkbox */}
      {onSelect && (
        <div className={cn(
          "absolute top-2 left-2 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
          selected ? "bg-primary border-primary opacity-100" : "border-white/60 bg-black/20 opacity-0 group-hover:opacity-100"
        )}>
          {selected && <Check className="h-3 w-3 text-white" />}
        </div>
      )}

      <div className="relative h-24 bg-muted/30 flex items-center justify-center">
        {isImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/files/${file.id}/preview`}
            alt={file.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        {!isImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md bg-card/80 backdrop-blur-sm hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer"
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
      <div className="px-3 pb-3 pt-2 space-y-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate" title={file.name}>{file.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatBytes(file.size)}</span>
          <span>·</span>
          <span>{formatDateRelative(file.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
