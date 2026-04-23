import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  File,
  type LucideIcon,
} from "lucide-react";

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateRelative(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  return formatDate(d);
}

const ICON_MAP: Record<string, LucideIcon> = {
  // Images
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  gif: FileImage,
  webp: FileImage,
  svg: FileImage,
  avif: FileImage,
  // Videos
  mp4: FileVideo,
  avi: FileVideo,
  mov: FileVideo,
  mkv: FileVideo,
  webm: FileVideo,
  // Audio
  mp3: FileAudio,
  wav: FileAudio,
  flac: FileAudio,
  ogg: FileAudio,
  // Archives
  zip: FileArchive,
  rar: FileArchive,
  "7z": FileArchive,
  tar: FileArchive,
  gz: FileArchive,
  // Code
  js: FileCode,
  ts: FileCode,
  tsx: FileCode,
  jsx: FileCode,
  py: FileCode,
  rs: FileCode,
  go: FileCode,
  java: FileCode,
  c: FileCode,
  cpp: FileCode,
  html: FileCode,
  css: FileCode,
  json: FileCode,
  // Spreadsheets
  xlsx: FileSpreadsheet,
  xls: FileSpreadsheet,
  csv: FileSpreadsheet,
  // Text / Docs
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  md: FileText,
};

const COLOR_MAP: Record<string, string> = {
  jpg: "text-emerald-400",
  jpeg: "text-emerald-400",
  png: "text-emerald-400",
  gif: "text-emerald-400",
  webp: "text-emerald-400",
  svg: "text-emerald-400",
  avif: "text-emerald-400",
  mp4: "text-purple-400",
  avi: "text-purple-400",
  mov: "text-purple-400",
  mkv: "text-purple-400",
  webm: "text-purple-400",
  mp3: "text-pink-400",
  wav: "text-pink-400",
  flac: "text-pink-400",
  ogg: "text-pink-400",
  zip: "text-yellow-400",
  rar: "text-yellow-400",
  "7z": "text-yellow-400",
  tar: "text-yellow-400",
  gz: "text-yellow-400",
  js: "text-sky-400",
  ts: "text-sky-400",
  tsx: "text-sky-400",
  jsx: "text-sky-400",
  py: "text-sky-400",
  pdf: "text-red-400",
  doc: "text-blue-400",
  docx: "text-blue-400",
  xlsx: "text-green-400",
  xls: "text-green-400",
  csv: "text-green-400",
};

export function getFileIcon(extension: string): LucideIcon {
  return ICON_MAP[extension.toLowerCase()] ?? File;
}

export function getFileIconColor(extension: string): string {
  return COLOR_MAP[extension.toLowerCase()] ?? "text-zinc-400";
}

export function parseWebhookUrl(webhookUrl: string): {
  webhookId: string;
  webhookToken: string;
} | null {
  const match = webhookUrl.match(
    /discord\.com\/api\/webhooks\/(\d+)\/([a-zA-Z0-9_-]+)/
  );
  if (!match) return null;
  return { webhookId: match[1], webhookToken: match[2] };
}
