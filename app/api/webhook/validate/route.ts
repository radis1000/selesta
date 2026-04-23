import { NextRequest, NextResponse } from "next/server";
import { validateWebhook } from "@/lib/discord/webhook";
import { parseWebhookUrl } from "@/lib/format";
import type { ValidateWebhookResponse } from "@/types/api";

export async function POST(req: NextRequest) {
  try {
    const { webhookUrl } = await req.json();

    if (!webhookUrl || typeof webhookUrl !== "string") {
      return NextResponse.json<ValidateWebhookResponse>(
        { valid: false, error: "URL webhook manquante" },
        { status: 400 }
      );
    }

    const parsed = parseWebhookUrl(webhookUrl);
    if (!parsed) {
      return NextResponse.json<ValidateWebhookResponse>(
        { valid: false, error: "Format d'URL webhook Discord invalide" },
        { status: 400 }
      );
    }

    const { webhookId, webhookToken } = parsed;
    const { channelId } = await validateWebhook(webhookId, webhookToken);

    return NextResponse.json<ValidateWebhookResponse>({
      valid: true,
      webhookId,
      webhookToken,
      channelId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json<ValidateWebhookResponse>(
      { valid: false, error: message },
      { status: 400 }
    );
  }
}
