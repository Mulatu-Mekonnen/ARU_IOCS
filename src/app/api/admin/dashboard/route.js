import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/lib/roleGuard";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await roleGuard("ADMIN");

    const [totalUsers, totalAgendas, pendingAgendas] =
      await Promise.all([
        prisma.user.count(),
        prisma.agenda.count(),
        prisma.agenda.count({ where: { status: "PENDING" } }),
      ]);

    return NextResponse.json({
      totalUsers,
      totalAgendas,
      pendingAgendas,
    });
  } catch {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }
}