import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyRole } from "@/lib/adminGuard";

const prisma = new PrismaClient();

// GET all agendas with office filter
export async function GET(request) {
  try {
    const auth = verifyRole(request, ["ADMIN", "HEAD"]);

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const officeId = searchParams.get("officeId");

    const agendas = await prisma.agenda.findMany({
      where: officeId ? { officeId: Number(officeId) } : {},
      include: {
        createdBy: true,
        office: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(agendas);

  } catch (error) {
    console.error("ADMIN AGENDA ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}