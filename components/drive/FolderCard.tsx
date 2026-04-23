"use client";

import { Folder, MoreHorizontal, Pencil, Trash2, FolderOpen } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { FolderRecord } from "@/types/api";

interface FolderCardProps {
  folder: FolderRecord;
  onOpen: (folder: FolderRecord) => void;
  onRename: (folder: FolderRecord) => void;
  onDelete: (folder: FolderRecord) => void;
}

export function FolderCard({ folder, onOpen, onRename, onDelete }: FolderCardProps) {
  return (
    <div
      className="group relative flex flex-col rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-accent/30 transition-all duration-150 cursor-pointer overflow-hidden"
      onDoubleClick={() => onOpen(folder)}
    >
      <div className="h-24 bg-amber-500/10 flex items-center justify-center">
        <FolderOpen className="h-10 w-10 text-amber-400/70 group-hover:text-amber-400 transition-colors" />
      </div>
      <div className="px-3 pb-3 pt-2 flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight truncate">{folder.name}</p>
          {folder._count && (
            <p className="text-xs text-muted-foreground">{folder._count.files} fichier{folder._count.files !== 1 ? "s" : ""}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOpen(folder)}><Folder className="h-4 w-4" />Ouvrir</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRename(folder)}><Pencil className="h-4 w-4" />Renommer</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(folder)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" />Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
