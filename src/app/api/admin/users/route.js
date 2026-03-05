import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyRole } from "@/lib/adminGuard";

const prisma = new PrismaClient();

export async function GET(request) {

  const auth = verifyRole(request, ["ADMIN"]);

  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const users = await prisma.user.findMany({
    include: {
      office: true,
    },
  });

  return NextResponse.json(users);
}