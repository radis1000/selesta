import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vérifie si un fichier avec le même checksum existe déjà (déduplication)
export async function GET(req: NextRequest) {
  const checksum = req.nextUrl.searchParams.get("checksum");
  const webhookId = req.nextUrl.searchParams.get("webhookId");
  if (!checksum || !webhookId)
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

  const existing = await prisma.file.findFirst({
    where: { checksum, webhookId },
    select: { id: true, name: true, size: true, mimeType: true, createdAt: true },
  });

  return NextResponse.json({ duplicate: existing ?? null });
}
