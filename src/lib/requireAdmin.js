import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function roleGuard(requiredRole) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  const payload = verifyToken(token);
  if (!payload) {
    const error = new Error("Invalid token");
    error.status = 401;
    throw error;
  }

  if (payload.role !== requiredRole) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, name: true, email: true, role: true, office: true },
  });

  if (!user) {
    const error = new Error("User not found");
    error.status = 403;
    throw error;
  }

  return user;
}