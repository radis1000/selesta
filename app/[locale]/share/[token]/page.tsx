import { notFound } from "next/navigation";
import { Download, HardDrive, Clock, FileText } from "lucide-react";
import { formatBytes } from "@/lib/format";

interface SharePageProps {
  params: Promise<{ locale: string; token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/share/${token}`, { cache: "no-store" });
  if (!res.ok) notFound();

  const { file, expiresAt } = await res.json();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <HardDrive className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-lg">SplitCord</span>
          </div>
          <p className="text-muted-foreground text-sm">Fichier partagé</p>
        </div>

        {/* File card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatBytes(file.size)} · {file.totalChunks} chunk{file.totalChunks > 1 ? "s" : ""}</p>
            </div>
          </div>

          {expiresAt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Expire le {new Date(expiresAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}
            </div>
          )}

          <a
            href={`/api/files/${file.id}/download`}
            download={file.name}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </a>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Propulsé par{" "}
          <span className="text-primary font-medium">SplitCord</span>
        </p>
      </div>
    </div>
  );
}
