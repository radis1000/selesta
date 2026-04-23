"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight, FolderPlus, Import, Upload, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Sidebar } from "@/components/drive/Sidebar";
import { Toolbar, type FileTypeFilter } from "@/components/drive/Toolbar";
import { FileGrid } from "@/components/drive/FileGrid";
import { FileList } from "@/components/drive/FileList";
import { FolderCard } from "@/components/drive/FolderCard";
import { EmptyState } from "@/components/drive/EmptyState";
import { UploadModal } from "@/components/drive/UploadModal";
import { DeleteDialog } from "@/components/drive/DeleteDialog";
import { DownloadProgress } from "@/components/drive/DownloadProgress";
import { FileViewer } from "@/components/drive/FileViewer";
import { RenameDialog } from "@/components/drive/RenameDialog";
import { NewFolderDialog } from "@/components/drive/NewFolderDialog";
import { ShareDialog } from "@/components/drive/ShareDialog";
import { MultiSelectBar } from "@/components/drive/MultiSelectBar";
import { ImportRadisDialog } from "@/components/drive/ImportRadisDialog";
import { Button } from "@/components/ui/button";

import { useFiles, type SortField, type SortOrder } from "@/hooks/useFiles";
import { useFolders } from "@/hooks/useFolders";
import { useUpload } from "@/hooks/useUpload";
import { useDownload } from "@/hooks/useDownload";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useWebhookStore } from "@/store/webhookStore";

import type { FileRecord, FolderRecord } from "@/types/api";

type ViewMode = "grid" | "list";

function matchesTypeFilter(file: FileRecord, filter: FileTypeFilter): boolean {
  if (filter === "all") return true;
  const mime = file.mimeType.toLowerCase();
  if (filter === "image") return mime.startsWith("image/");
  if (filter === "video") return mime.startsWith("video/");
  if (filter === "audio") return mime.startsWith("audio/");
  if (filter === "document") return mime.startsWith("text/") || mime.includes("pdf") || mime.includes("word");
  if (filter === "archive") return ["zip", "rar", "7z", "tar", "gzip"].some((e) => mime.includes(e));
  return !["image/", "video/", "audio/", "text/"].some((p) => mime.startsWith(p)) && !mime.includes("pdf");
}

export default function DrivePage() {
  const router = useRouter();
  const t = useTranslations("drive");
  const { isConfigured, webhookId, webhookToken } = useWebhookStore();

  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [typeFilter, setTypeFilter] = useState<FileTypeFilter>("all");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Dialog states
  const [fileToDelete, setFileToDelete] = useState<FileRecord | null>(null);
  const [fileToView, setFileToView] = useState<FileRecord | null>(null);
  const [fileToRename, setFileToRename] = useState<FileRecord | null>(null);
  const [folderToRename, setFolderToRename] = useState<FolderRecord | null>(null);
  const [fileToShare, setFileToShare] = useState<FileRecord | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showImportRadis, setShowImportRadis] = useState(false);

  // Storage limit
  const [storageLimit, setStorageLimit] = useState(0);

  // Drag & drop overlay
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { files, isLoading, refetch, deleteFile, deleteFiles, renameFile, moveFile } = useFiles(sortBy, sortOrder, currentFolderId);
  const { folders, createFolder, renameFolder, deleteFolder, refetch: refetchFolders } = useFolders();
  const { uploadFiles } = useUpload(
    () => { refetch(); refetchFolders(); },
    currentFolderId
  );
  const { downloadFile } = useDownload();

  useEffect(() => {
    if (!isConfigured) router.replace("/setup");
  }, [isConfigured, router]);

  useEffect(() => {
    const saved = localStorage.getItem("splitcord-storage-limit");
    if (saved) setStorageLimit(Number(saved));
  }, []);

  // Selection helpers
  const handleSelect = useCallback((id: string, multi: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (multi) {
        next.has(id) ? next.delete(id) : next.add(id);
      } else {
        if (next.size === 1 && next.has(id)) next.clear();
        else { next.clear(); next.add(id); }
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredFiles.map((f) => f.id)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const handleFiles = useCallback(async (newFiles: File[]) => {
    if (!newFiles.length) return;
    // Browser notification permission
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    await uploadFiles(newFiles);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("SplitCord", { body: `${newFiles.length} fichier${newFiles.length > 1 ? "s" : ""} uploadé${newFiles.length > 1 ? "s" : ""} !` });
    }
  }, [uploadFiles]);

  const handleDelete = useCallback(async (file: FileRecord) => {
    await deleteFile(file.id);
    toast.success(t("download.deleted", { name: file.name }));
    refetchFolders();
  }, [deleteFile, refetchFolders, t]);

  const handleBulkDelete = useCallback(async () => {
    if (!selectedIds.size) return;
    setIsDeleting(true);
    try {
      await deleteFiles(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} fichier${selectedIds.size > 1 ? "s" : ""} supprimé${selectedIds.size > 1 ? "s" : ""}`);
      refetchFolders();
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds, deleteFiles, refetchFolders]);

  const handleBulkDownload = useCallback(() => {
    const toDownload = files.filter((f) => selectedIds.has(f.id));
    toDownload.forEach((f) => { downloadFile(f); });
    setSelectedIds(new Set());
  }, [selectedIds, files, downloadFile]);

  const handleMove = useCallback(async (file: FileRecord, folderId: string | null) => {
      await moveFile(file.id, folderId);
    toast.success(`"${file.name}" déplacé`);
    refetch();
    refetchFolders();
  }, [moveFile, refetch]);

  const filteredFiles = useMemo(
    () => files.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase())).filter((f) => matchesTypeFilter(f, typeFilter)),
    [files, searchQuery, typeFilter]
  );

  const currentFolder = folders.find((f) => f.id === currentFolderId) ?? null;

  useKeyboardShortcuts({
    onUpload: () => fileInputRef.current?.click(),
    onSelectAll: handleSelectAll,
    onEscape: () => { setSelectedIds(new Set()); setFileToView(null); },
    onDeleteSelected: () => { if (selectedIds.size > 0) handleBulkDelete(); },
    onRefresh: refetch,
    onSearch: () => searchRef.current?.focus(),
  });

  if (!isConfigured) return null;

  const hasFiles = files.length > 0;
  const hasResults = filteredFiles.length > 0;
  const hasFoldersInView = folders.length > 0 && currentFolderId === null;
  const isFiltered = searchQuery.length > 0 || typeFilter !== "all";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        files={files}
        folders={folders}
        currentFolderId={currentFolderId}
        storageLimit={storageLimit}
        onNavigate={(id) => { setCurrentFolderId(id); setSelectedIds(new Set()); }}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 border-b border-border">
          <Toolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onUpload={() => fileInputRef.current?.click()}
            onRefresh={refetch}
            isLoading={isLoading}
            fileCount={filteredFiles.length}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(field, order) => { setSortBy(field); setSortOrder(order); }}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            searchRef={searchRef}
          />
        </div>

        {/* Breadcrumb + folder actions */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-border/50">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <button onClick={() => setCurrentFolderId(null)} className="hover:text-foreground transition-colors">{t("sidebar.myDrive")}</button>
            {currentFolder && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-medium">{currentFolder.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowNewFolder(true)} className="text-xs gap-1.5">
              <FolderPlus className="h-3.5 w-3.5" />Nouveau dossier
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowImportRadis(true)} className="text-xs gap-1.5">
              <Import className="h-3.5 w-3.5" />Importer .radis
            </Button>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto px-6 py-4 relative"
          onDragEnter={(e) => {
            e.preventDefault();
            dragCounterRef.current++;
            if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            dragCounterRef.current--;
            if (dragCounterRef.current === 0) setIsDragging(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            dragCounterRef.current = 0;
            setIsDragging(false);
            const dropped = Array.from(e.dataTransfer.files);
            if (dropped.length) handleFiles(dropped);
          }}
          onClick={() => setSelectedIds(new Set())}
        >
          {/* Drag & drop overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/5 backdrop-blur-sm pointer-events-none">
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
                  <UploadCloud className="h-10 w-10 text-primary animate-bounce" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-primary">Déposer pour uploader</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentFolderId
                      ? `Dans le dossier sélectionné`
                      : "Dans Mon Drive"}
                  </p>
                </div>
              </div>
            </div>
          )}
          {isLoading && files.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
                <p className="text-sm">{t("loading")}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
              {/* Folders row (root only, no filter active) */}
              {hasFoldersInView && !isFiltered && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Dossiers</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {folders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        onOpen={(f) => setCurrentFolderId(f.id)}
                        onRename={setFolderToRename}
                        onDelete={async (f) => {
                          await deleteFolder(f.id);
                          toast.success(`Dossier "${f.name}" supprimé`);
                          refetch();
                          refetchFolders();
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {(hasFiles || isFiltered) && (
                <div>
                  {hasFoldersInView && !isFiltered && (
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Fichiers</p>
                  )}
                  {!hasResults ? (
                    <EmptyState onUpload={() => fileInputRef.current?.click()} isFiltered={isFiltered} searchQuery={searchQuery} />
                  ) : viewMode === "grid" ? (
                    <FileGrid
                      files={filteredFiles}
                      folders={folders}
                      selectedIds={selectedIds}
                      onSelect={handleSelect}
                      onDownload={(f) => { downloadFile(f); toast.info(t("download.started", { name: f.name })); }}
                      onDelete={setFileToDelete}
                      onRename={setFileToRename}
                      onShare={setFileToShare}
                      onView={setFileToView}
                      onMove={handleMove}
                    />
                  ) : (
                    <FileList
                      files={filteredFiles}
                      folders={folders}
                      selectedIds={selectedIds}
                      onSelect={handleSelect}
                      onDownload={(f) => { downloadFile(f); toast.info(t("download.started", { name: f.name })); }}
                      onDelete={setFileToDelete}
                      onRename={setFileToRename}
                      onShare={setFileToShare}
                      onView={setFileToView}
                      onMove={handleMove}
                    />
                  )}
                </div>
              )}

              {!hasFiles && !hasFoldersInView && (
                <EmptyState onUpload={() => fileInputRef.current?.click()} />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) { handleFiles(Array.from(e.target.files)); e.target.value = ""; }
        }}
      />

      {/* Upload trigger shortcut hint */}
      <div className="fixed bottom-4 right-4 z-10">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center cursor-pointer"
          title="Uploader (Ctrl+U)"
        >
          <Upload className="h-5 w-5" />
        </button>
      </div>

      {/* Modals & dialogs */}
      <UploadModal />
      <DownloadProgress />
      <FileViewer file={fileToView} onClose={() => setFileToView(null)} onDownload={(f) => { downloadFile(f); }} />

      <DeleteDialog
        file={fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={async (file) => { await handleDelete(file); }}
      />

      <RenameDialog
        open={!!fileToRename}
        currentName={fileToRename?.name ?? ""}
        onClose={() => setFileToRename(null)}
        onConfirm={async (name) => { if (fileToRename) await renameFile(fileToRename.id, name); }}
      />

      <RenameDialog
        open={!!folderToRename}
        currentName={folderToRename?.name ?? ""}
        onClose={() => setFolderToRename(null)}
        onConfirm={async (name) => { if (folderToRename) await renameFolder(folderToRename.id, name); }}
      />

      <NewFolderDialog
        open={showNewFolder}
        onClose={() => setShowNewFolder(false)}
        onConfirm={async (name) => { await createFolder(name); await refetchFolders(); }}
      />

      <ShareDialog file={fileToShare} onClose={() => setFileToShare(null)} />

      <ImportRadisDialog
        open={showImportRadis}
        onClose={() => setShowImportRadis(false)}
        onImported={refetch}
      />

      <MultiSelectBar
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDeleteSelected={handleBulkDelete}
        onDownloadSelected={handleBulkDownload}
        isDeleting={isDeleting}
      />
    </div>
  );
}
