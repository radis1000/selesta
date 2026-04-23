import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { FileRecord } from "@/types/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const webhookId = searchParams.get("webhookId");
    if (!webhookId)
      return NextResponse.json({ error: "webhookId requis" }, { status: 400 });

    const sortBy = (searchParams.get("sortBy") ?? "createdAt") as "name" | "size" | "createdAt";
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10)));
    const skip = (page - 1) * limit;
    const folderParam = searchParams.get("folderId");

    const validSortFields = ["name", "size", "createdAt"] as const;
    const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const where: Record<string, unknown> = { webhookId };
    if (folderParam === "root") {
      where.folderId = null;
    } else if (folderParam) {
      where.folderId = folderParam;
    }

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        orderBy: { [orderField]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true, name: true, extension: true, mimeType: true,
          size: true, checksum: true, totalChunks: true, folderId: true, createdAt: true,
        },
      }),
      prisma.file.count({ where }),
    ]);

    const records: FileRecord[] = files.map((f) => ({
      id: f.id, name: f.name, extension: f.extension, mimeType: f.mimeType,
      size: Number(f.size), checksum: f.checksum, totalChunks: f.totalChunks,
      folderId: f.folderId, createdAt: f.createdAt.toISOString(),
    }));

    return NextResponse.json({ files: records, total, page, limit });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
