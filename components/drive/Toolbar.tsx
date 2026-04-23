"use client";

import { Search, LayoutGrid, List, Upload, RefreshCw, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SortField, SortOrder } from "@/hooks/useFiles";

type ViewMode = "grid" | "list";
export type FileTypeFilter = "all" | "image" | "video" | "audio" | "document" | "archive" | "other";

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onUpload: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  fileCount: number;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  typeFilter: FileTypeFilter;
  onTypeFilterChange: (type: FileTypeFilter) => void;
  searchRef?: RefObject<HTMLInputElement | null>;
}

const SORT_KEYS = [
  "createdAt_desc", "createdAt_asc",
  "name_asc", "name_desc",
  "size_desc", "size_asc",
] as const;

const TYPE_KEYS: FileTypeFilter[] = ["all", "image", "video", "audio", "document", "archive", "other"];

export function Toolbar({
  searchQuery, onSearchChange, viewMode, onViewModeChange,
  onUpload, onRefresh, isLoading, fileCount,
  sortBy, sortOrder, onSortChange, typeFilter, onTypeFilterChange,
  searchRef,
}: ToolbarProps) {
  const t = useTranslations("drive.toolbar");
  const sortKey = `${sortBy}_${sortOrder}`;

  function handleSortChange(value: string) {
    const lastUnderscore = value.lastIndexOf("_");
    const field = value.slice(0, lastUnderscore) as SortField;
    const order = value.slice(lastUnderscore + 1) as SortOrder;
    onSortChange(field, order);
  }

  return (
    <div className="flex items-center gap-3 py-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input ref={searchRef} placeholder={t("search")} value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 h-9">
            {t(`filter.${typeFilter}`)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>{t("filterLabel")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as FileTypeFilter)}>
            {TYPE_KEYS.map((k) => (
              <DropdownMenuRadioItem key={k} value={k}>{t(`filter.${k}`)}</DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {fileCount > 0 && (
        <span className="hidden lg:block text-xs text-muted-foreground whitespace-nowrap">
          {t("fileCount", { count: fileCount })}
        </span>
      )}

      <div className="flex items-center gap-1 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowUpDown className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("sortLabel")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sortKey} onValueChange={handleSortChange}>
              {SORT_KEYS.map((k) => (
                <DropdownMenuRadioItem key={k} value={k}>{t(`sort.${k}`)}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoading} className="h-9 w-9">
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>

        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          <button onClick={() => onViewModeChange("grid")} className={cn("p-2 transition-colors cursor-pointer", viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => onViewModeChange("list")} className={cn("p-2 transition-colors cursor-pointer", viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
            <List className="h-4 w-4" />
          </button>
        </div>

        <Button onClick={onUpload} className="gap-2">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">{t("upload")}</span>
        </Button>
      </div>
    </div>
  );
}
