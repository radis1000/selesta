import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const webhookId = req.headers.get("x-webhook-id");
  const webhookToken = req.headers.get("x-webhook-token");
  const { name } = await req.json();

  const folder = await prisma.folder.findUnique({ where: { id } });
  if (!folder) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  if (folder.webhookId !== webhookId || folder.webhookToken !== webhookToken)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const updated = await prisma.folder.update({ where: { id }, data: { name: name.trim() } });
  return NextResponse.json({ folder: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const webhookId = req.headers.get("x-webhook-id");
  const webhookToken = req.headers.get("x-webhook-token");

  const folder = await prisma.folder.findUnique({ where: { id } });
  if (!folder) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  if (folder.webhookId !== webhookId || folder.webhookToken !== webhookToken)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  // Déplace les fichiers du dossier à la racine
  await prisma.file.updateMany({ where: { folderId: id }, data: { folderId: null } });
  await prisma.folder.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
