"use client";

import { Upload, HardDrive } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onUpload: () => void;
  isFiltered?: boolean;
  searchQuery?: string;
}

export function EmptyState({ onUpload, isFiltered, searchQuery }: EmptyStateProps) {
  const t = useTranslations("drive.empty");

  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <HardDrive className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1">{t("noResults")}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {searchQuery ? t("noResultsFor", { query: searchQuery }) : t("noResultsType")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-muted/30 border border-border flex items-center justify-center">
          <HardDrive className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <Upload className="h-4 w-4 text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{t("title")}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">{t("description")}</p>
      <Button onClick={onUpload} className="gap-2">
        <Upload className="h-4 w-4" />
        {t("cta")}
      </Button>
      <p className="text-xs text-muted-foreground mt-4">{t("dragHint")}</p>
    </div>
  );
}
