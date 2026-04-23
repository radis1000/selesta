"use client";

import { useState } from "react";
import { Plus, Check, Trash2, ChevronDown, Pencil } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useWebhookStore } from "@/store/webhookStore";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Workspace } from "@/types/api";

export function WorkspaceSwitcher() {
  const router = useRouter();
  const { workspaces, activeId, switchWorkspace, removeWorkspace, renameWorkspace } = useWebhookStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const active = workspaces.find((w) => w.id === activeId);

  function startEdit(ws: Workspace) {
    setEditingId(ws.id);
    setEditName(ws.name);
  }

  function commitEdit(id: string) {
    if (editName.trim()) renameWorkspace(id, editName.trim());
    setEditingId(null);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors cursor-pointer">
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs text-muted-foreground">Espace</p>
            <p className="font-medium truncate">{active?.name ?? "—"}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((ws) => (
          <div key={ws.id} className="flex items-center gap-1 px-1">
            {editingId === ws.id ? (
              <input
                className="flex-1 text-sm px-2 py-1.5 rounded bg-muted outline-none"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => commitEdit(ws.id)}
                onKeyDown={(e) => { if (e.key === "Enter") commitEdit(ws.id); if (e.key === "Escape") setEditingId(null); }}
                autoFocus
              />
            ) : (
              <button
                className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors text-left cursor-pointer"
                onClick={() => switchWorkspace(ws.id)}
              >
                {activeId === ws.id && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                <span className={`truncate ${activeId !== ws.id ? "pl-5" : ""}`}>{ws.name}</span>
              </button>
            )}
            <button onClick={() => startEdit(ws)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
              <Pencil className="h-3 w-3" />
            </button>
            {workspaces.length > 1 && (
              <button onClick={() => removeWorkspace(ws.id)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        <DropdownMenuSeparator />
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          onClick={() => router.push("/setup")}
        >
          <Plus className="h-3.5 w-3.5" /> Ajouter un webhook
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
