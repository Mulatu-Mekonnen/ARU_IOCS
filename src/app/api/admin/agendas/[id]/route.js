import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyRole } from "@/lib/adminGuard";

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  try {
    const auth = verifyRole(request, ["ADMIN", "HEAD"]);

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { status } = await request.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.agenda.update({
      where: { id: Number(params.id) },
      data: { status },
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("UPDATE AGENDA ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}