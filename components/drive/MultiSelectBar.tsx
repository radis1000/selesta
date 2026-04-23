"use client";

import { Trash2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MultiSelectBarProps {
  selectedCount: number;
  onClear: () => void;
  onDeleteSelected: () => void;
  onDownloadSelected: () => void;
  isDeleting?: boolean;
}

export function MultiSelectBar({ selectedCount, onClear, onDeleteSelected, onDownloadSelected, isDeleting }: MultiSelectBarProps) {
  if (selectedCount === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-sm">
      <button onClick={onClear} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
        <X className="h-4 w-4" />
      </button>
      <span className="text-sm font-semibold tabular-nums">{selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}</span>
      <div className="w-px h-5 bg-border" />
      <Button variant="ghost" size="sm" onClick={onDownloadSelected}>
        <Download className="h-4 w-4" />Télécharger
      </Button>
      <Button variant="ghost" size="sm" onClick={onDeleteSelected} disabled={isDeleting} className="text-destructive hover:text-destructive hover:bg-destructive/10">
        <Trash2 className="h-4 w-4" />{isDeleting ? "Suppression…" : "Supprimer"}
      </Button>
    </div>
  );
}
