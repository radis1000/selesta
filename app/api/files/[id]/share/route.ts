import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const webhookId = req.headers.get("x-webhook-id");
  const webhookToken = req.headers.get("x-webhook-token");

  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  if (file.webhookId !== webhookId || file.webhookToken !== webhookToken)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  const share = await prisma.shareToken.create({
    data: { fileId: id, expiresAt },
  });

  return NextResponse.json({ token: share.token }, { status: 201 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const shares = await prisma.shareToken.findMany({
    where: { fileId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ shares });
}
