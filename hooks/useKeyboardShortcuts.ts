"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onUpload: () => void;
  onSelectAll: () => void;
  onEscape: () => void;
  onDeleteSelected: () => void;
  onRefresh: () => void;
  onSearch: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;

      if (e.key === "Escape") { handlers.onEscape(); return; }
      if (isInput) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "u") { e.preventDefault(); handlers.onUpload(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "a") { e.preventDefault(); handlers.onSelectAll(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "r") { e.preventDefault(); handlers.onRefresh(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "f") { e.preventDefault(); handlers.onSearch(); }
      if (e.key === "Delete" || e.key === "Backspace") { handlers.onDeleteSelected(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
