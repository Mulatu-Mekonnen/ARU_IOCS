import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/adminGuard";

export async function GET(request, { params }) {
  const auth = verifyRole(request, ["ADMIN", "HEAD", "STAFF", "VIEWER"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Next.js dynamic route params are async, so we await them first
  const { id: rawId } = await params;
  console.log('Timeline API params rawId:', rawId, typeof rawId);
  // Prisma uses string IDs (cuid), so no need to parse as int
  const id = rawId;
  console.log('Timeline API parsed ID:', id);
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: "Invalid agenda id" }, { status: 400 });
  }

  const agenda = await prisma.agenda.findUnique({
    where: { id },
    include: { approvalHistories: { include: { actionBy: true } } },
  });

  if (!agenda) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // enforce role-specific visibility (same rules as the main agenda GET)
  if (auth.user.role === "HEAD") {
    const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
    if (agenda.senderOfficeId !== user.officeId && agenda.receiverOfficeId !== user.officeId && agenda.currentOfficeId !== user.officeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  if (auth.user.role === "STAFF") {
    if (agenda.createdById !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  if (auth.user.role === "VIEWER") {
    if (agenda.status !== "APPROVED") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const timeline = agenda.approvalHistories
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((entry) => ({
      id: entry.id,
      action: entry.action,
      comment: entry.comment,
      by: entry.actionBy?.name || "Unknown",
      at: entry.createdAt,
    }));

  return NextResponse.json({ timeline });
}
