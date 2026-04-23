import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const webhookId = req.nextUrl.searchParams.get("webhookId");
  if (!webhookId) return NextResponse.json({ error: "webhookId requis" }, { status: 400 });

  const folders = await prisma.folder.findMany({
    where: { webhookId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { files: true } } },
  });

  return NextResponse.json({ folders });
}

export async function POST(req: NextRequest) {
  const { name, webhookId, webhookToken } = await req.json();
  if (!name || !webhookId || !webhookToken)
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

  const folder = await prisma.folder.create({
    data: { name: name.trim(), webhookId, webhookToken },
  });
  return NextResponse.json({ folder }, { status: 201 });
}
