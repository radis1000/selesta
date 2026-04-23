"use client";

import { useState } from "react";
import { Share2, Copy, Check, Loader2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWebhookStore } from "@/store/webhookStore";
import { toast } from "sonner";
import type { FileRecord } from "@/types/api";

type Expiry = "never" | "1h" | "24h" | "7d";

const EXPIRY_LABELS: Record<Expiry, string> = {
  never: "Jamais",
  "1h": "1 heure",
  "24h": "24 heures",
  "7d": "7 jours",
};

function expiryToDate(e: Expiry): string | null {
  if (e === "never") return null;
  const ms = { "1h": 3600000, "24h": 86400000, "7d": 604800000 }[e];
  return new Date(Date.now() + ms).toISOString();
}

interface ShareDialogProps {
  file: FileRecord | null;
  onClose: () => void;
}

export function ShareDialog({ file, onClose }: ShareDialogProps) {
  const { webhookId, webhookToken } = useWebhookStore();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<Expiry>("never");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!file) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/files/${file.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-id": webhookId,
          "x-webhook-token": webhookToken,
        },
        body: JSON.stringify({ expiresAt: expiryToDate(expiry) }),
      });
      const data = await res.json();
      setShareUrl(`${window.location.origin}/share/${data.token}`);
    } catch {
      toast.error("Impossible de générer le lien");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    setShareUrl(null);
    setExpiry("never");
    onClose();
  }

  return (
    <Dialog open={!!file} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Partager "{file?.name}"
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {!shareUrl ? (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Expiration du lien</p>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(EXPIRY_LABELS) as Expiry[]).map((e) => (
                    <button
                      key={e}
                      onClick={() => setExpiry(e)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors cursor-pointer ${expiry === e ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                    >
                      {EXPIRY_LABELS[e]}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={generate} disabled={isLoading} className="w-full">
                {isLoading ? <><Loader2 className="animate-spin" />Génération…</> : <><Share2 className="h-4 w-4" />Générer le lien</>}
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <p className="flex-1 text-xs font-mono text-foreground truncate">{shareUrl}</p>
                <button onClick={copyLink} className="flex-shrink-0 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {expiry === "never" ? "Lien sans expiration" : `Expire dans : ${EXPIRY_LABELS[expiry]}`}
              </p>
              <Button variant="outline" onClick={() => setShareUrl(null)} className="w-full">
                Nouveau lien
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
