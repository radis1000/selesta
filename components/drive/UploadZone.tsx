"use client";

import { useRef, useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadZone({ onFiles, disabled }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;
      onFiles(Array.from(files));
    },
    [onFiles, disabled]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <>
      <div
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "fixed inset-0 z-40 transition-all duration-200 pointer-events-none",
          isDragOver &&
            "pointer-events-auto bg-primary/5 border-2 border-dashed border-primary/50"
        )}
      >
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-primary/30 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Déposer les fichiers</p>
                <p className="text-sm text-muted-foreground">
                  Ils seront uploadés sur Discord
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      <button
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "hidden",
          !disabled && "block"
        )}
        aria-label="Sélectionner des fichiers"
      />
    </>
  );
}

export function useUploadTrigger() {
  const inputRef = useRef<HTMLInputElement>(null);

  const trigger = () => inputRef.current?.click();

  const InputElement = ({ onFiles }: { onFiles: (files: File[]) => void }) => (
    <input
      ref={inputRef}
      type="file"
      multiple
      className="hidden"
      onChange={(e) => {
        if (e.target.files) {
          onFiles(Array.from(e.target.files));
          e.target.value = "";
        }
      }}
    />
  );

  return { trigger, InputElement };
}
