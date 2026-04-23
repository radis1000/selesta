import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const file = await prisma.file.findUnique({
      where: { id },
      include: { chunks: { orderBy: { index: "asc" } } },
    });

    if (!file) {
      return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
    }

    const manifest = {
      version: "1.0",
      name: file.name,
      extension: file.extension,
      mimeType: file.mimeType,
      size: Number(file.size),
      checksum: file.checksum,
      createdAt: file.createdAt.toISOString(),
      webhookId: file.webhookId,
      webhookToken: file.webhookToken,
      chunks: file.chunks.map((c) => ({
        index: c.index,
        size: c.size,
        messageId: c.messageId,
        checksum: c.checksum,
      })),
    };

    const fileName = `${file.name}.radis`;
    const encodedName = encodeURIComponent(fileName);

    return new NextResponse(JSON.stringify(manifest, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
