"use client";

import { useState, useRef } from "react";
import { FileJson, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImportRadisDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export function ImportRadisDialog({ open, onClose, onImported }: ImportRadisDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setIsLoading(true);
    setResult(null);
    try {
      const text = await file.text();
      const manifest = JSON.parse(text);

      // Validate manifest structure
      if (!manifest.name || !manifest.checksum || !Array.isArray(manifest.chunks) || !manifest.webhookId || !manifest.webhookToken) {
        throw new Error("Fichier .radis invalide ou incomplet");
      }

      const res = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: manifest.name,
          extension: manifest.extension ?? "",
          mimeType: manifest.mimeType ?? "application/octet-stream",
          size: manifest.size ?? 0,
          checksum: manifest.checksum,
          webhookId: manifest.webhookId,
          webhookToken: manifest.webhookToken,
          totalChunks: manifest.chunks.length,
          chunks: manifest.chunks,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erreur lors de l'import");
      }

      setResult("success");
      toast.success(`"${manifest.name}" importé avec succès`);
      onImported();
      setTimeout(onClose, 1500);
    } catch (err) {
      setResult("error");
      toast.error(err instanceof Error ? err.message : "Erreur d'import");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-4 w-4" /> Importer un fichier .radis
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Importez un manifeste <code className="text-xs bg-muted px-1 py-0.5 rounded">.radis</code> pour réenregistrer un fichier
            dont vous possédez déjà le webhook source. Les chunks restent sur Discord.
          </p>
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
          >
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            ) : result === "success" ? (
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            ) : result === "error" ? (
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            )}
            <p className="text-sm font-medium">
              {isLoading ? "Importation en cours…" : result === "success" ? "Importé !" : "Glissez votre fichier .radis ici"}
            </p>
            {!isLoading && result !== "success" && (
              <p className="text-xs text-muted-foreground mt-1">ou cliquez pour sélectionner</p>
            )}
          </div>
          <input ref={inputRef} type="file" accept=".radis,application/json" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          <Button variant="outline" onClick={onClose} className="w-full">Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
