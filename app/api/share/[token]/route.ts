import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const share = await prisma.shareToken.findUnique({
    where: { token },
    include: {
      file: {
        select: {
          id: true, name: true, extension: true,
          mimeType: true, size: true, totalChunks: true, createdAt: true,
        },
      },
    },
  });

  if (!share) return NextResponse.json({ error: "Lien introuvable" }, { status: 404 });
  if (share.expiresAt && share.expiresAt < new Date())
    return NextResponse.json({ error: "Lien expiré" }, { status: 410 });

  return NextResponse.json({
    file: { ...share.file, size: Number(share.file.size), createdAt: share.file.createdAt.toISOString() },
    expiresAt: share.expiresAt?.toISOString() ?? null,
  });
}
