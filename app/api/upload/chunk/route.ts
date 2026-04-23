import { NextRequest, NextResponse } from "next/server";
import { sendChunk } from "@/lib/discord/webhook";
import { parseWebhookUrl } from "@/lib/format";
import type { UploadChunkResponse } from "@/types/api";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const chunkBlob = formData.get("chunk") as Blob | null;
    const indexStr = formData.get("index") as string | null;
    const webhookUrl = formData.get("webhookUrl") as string | null;
    const fileName = formData.get("fileName") as string | null;

    if (!chunkBlob || indexStr === null || !webhookUrl || !fileName) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    const index = parseInt(indexStr, 10);
    if (isNaN(index)) {
      return NextResponse.json({ error: "Index invalide" }, { status: 400 });
    }

    const parsed = parseWebhookUrl(webhookUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: "URL webhook invalide" },
        { status: 400 }
      );
    }

    const chunkBuffer = await chunkBlob.arrayBuffer();
    const { messageId } = await sendChunk(
      parsed.webhookId,
      parsed.webhookToken,
      chunkBuffer,
      index,
      fileName
    );

    return NextResponse.json<UploadChunkResponse>({ messageId, index });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[upload/chunk]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
