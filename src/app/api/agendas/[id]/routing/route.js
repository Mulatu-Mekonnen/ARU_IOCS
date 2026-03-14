import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/adminGuard";

export async function GET(request, { params }) {
  const auth = verifyRole(request, ["ADMIN", "HEAD", "STAFF", "VIEWER"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const agenda = await prisma.agenda.findUnique({
    where: { id: params.id },
    include: {
      routes: {
        include: {
          fromOffice: true,
          toOffice: true,
          routedBy: true,
        },
        orderBy: { routedAt: "asc" },
      },
    },
  });

  if (!agenda) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // enforce role-specific visibility
  if (auth.user.role === "HEAD") {
    const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
    if (agenda.senderOfficeId !== user.officeId && agenda.receiverOfficeId !== user.officeId) {
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

  const routing = agenda.routes.map((r) => ({
    id: r.id,
    from: r.fromOffice?.name || "Unknown",
    to: r.toOffice?.name || "Unknown",
    by: r.routedBy?.name || "Unknown",
    at: r.routedAt,
  }));

  return NextResponse.json({ routing });
}
