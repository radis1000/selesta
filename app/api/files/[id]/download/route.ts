import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  extractAttachmentUrl,
  downloadAttachment,
} from "@/lib/discord/messages";

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

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (const chunk of file.chunks) {
            const attachmentUrl = await extractAttachmentUrl(
              file.webhookId,
              file.webhookToken,
              chunk.messageId
            );
            const data = await downloadAttachment(attachmentUrl);
            controller.enqueue(new Uint8Array(data));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    const fileName = `${file.name}`;
    const encodedName = encodeURIComponent(fileName);

    return new NextResponse(stream, {
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
        "Content-Length": file.size.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[files/download]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
