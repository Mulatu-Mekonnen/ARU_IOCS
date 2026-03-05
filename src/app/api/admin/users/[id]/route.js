import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const auth = verifyRole(req, ["ADMIN"]);

  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }   

  const body = await req.json();

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      role: body.role,
      active: body.active,
      officeId: body.officeId,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(req, { params }) {
  await requireAdmin();

  await prisma.user.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}