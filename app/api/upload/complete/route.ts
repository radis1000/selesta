import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { UploadCompleteRequest, UploadCompleteResponse } from "@/types/api";

export async function POST(req: NextRequest) {
  try {
    const body: UploadCompleteRequest = await req.json();

    const {
      name,
      extension,
      mimeType,
      size,
      checksum,
      webhookId,
      webhookToken,
      totalChunks,
      folderId,
      chunks,
    } = body;

    if (
      !name || !extension || !mimeType || !size || !checksum ||
      !webhookId || !webhookToken || !chunks?.length
    ) {
      return NextResponse.json(
        { error: "Données de manifeste incomplètes" },
        { status: 400 }
      );
    }

    if (chunks.length !== totalChunks) {
      return NextResponse.json(
        { error: `Nombre de chunks attendu: ${totalChunks}, reçu: ${chunks.length}` },
        { status: 400 }
      );
    }

    const file = await prisma.file.create({
      data: {
        name,
        extension,
        mimeType,
        size: BigInt(size),
        checksum,
        webhookId,
        webhookToken,
        totalChunks,
        folderId: folderId ?? null,
        chunks: {
          create: chunks.map((c) => ({
            index: c.index,
            size: c.size,
            messageId: c.messageId,
            checksum: c.checksum,
          })),
        },
      },
    });

    return NextResponse.json<UploadCompleteResponse>({ fileId: file.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[upload/complete]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
