"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { FileRecord } from "@/types/api";

interface DeleteDialogProps {
  file: FileRecord | null;
  onClose: () => void;
  onConfirm: (file: FileRecord) => Promise<void>;
}

export function DeleteDialog({ file, onClose, onConfirm }: DeleteDialogProps) {
  const t = useTranslations("drive.delete");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!file) return;
    setIsDeleting(true);
    try {
      await onConfirm(file);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={!!file} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />{t("title")}
          </DialogTitle>
          <DialogDescription>
            {file && t("description", { name: file.name, count: file.totalChunks })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>{t("cancel")}</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (<><Loader2 className="animate-spin" />{t("deleting")}</>) : (<><Trash2 />{t("confirm")}</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
