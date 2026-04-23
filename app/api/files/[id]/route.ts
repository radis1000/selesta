import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteMessage } from "@/lib/discord/webhook";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const file = await prisma.file.findUnique({
    where: { id },
    include: { chunks: { orderBy: { index: "asc" } } },
  });
  if (!file) return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  return NextResponse.json({ file });
}

export async function PATCH(
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

  const body = await req.json();
  const data: { name?: string; folderId?: string | null } = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if ("folderId" in body) data.folderId = body.folderId ?? null;

  const updated = await prisma.file.update({ where: { id }, data });
  return NextResponse.json({
    file: { ...updated, size: Number(updated.size), createdAt: updated.createdAt.toISOString() },
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const webhookId = req.headers.get("x-webhook-id");
  const webhookToken = req.headers.get("x-webhook-token");

  const file = await prisma.file.findUnique({ where: { id }, include: { chunks: true } });
  if (!file) return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  if (file.webhookId !== webhookId || file.webhookToken !== webhookToken)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  // Supprime les messages Discord (best-effort)
  await Promise.allSettled(
    file.chunks.map((chunk) =>
      deleteMessage(file.webhookId, file.webhookToken, chunk.messageId)
    )
  );

  await prisma.file.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
