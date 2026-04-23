import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMessage } from "@/lib/discord/messages";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        chunks: {
          orderBy: { index: "asc" },
          take: 1,
        },
      },
    });

    if (!file || !file.mimeType.startsWith("image/")) {
      return NextResponse.json({ error: "Preview non disponible" }, { status: 404 });
    }

    const firstChunk = file.chunks[0];
    if (!firstChunk) {
      return NextResponse.json({ error: "Aucun chunk trouvé" }, { status: 404 });
    }

    const message = await fetchMessage(
      file.webhookId,
      file.webhookToken,
      firstChunk.messageId
    );

    const attachmentUrl = message.attachments?.[0]?.url;
    if (!attachmentUrl) {
      return NextResponse.json({ error: "Attachment introuvable" }, { status: 404 });
    }

    // Proxy l'image via Next.js pour éviter les problèmes CORS + header Discord
    const imgRes = await fetch(attachmentUrl);
    if (!imgRes.ok) {
      return NextResponse.json({ error: "Image inaccessible" }, { status: 502 });
    }

    const buffer = await imgRes.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.mimeType,
        "Cache-Control": "public, max-age=1800, s-maxage=1800", // 30 min — durée de vie CDN Discord
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
