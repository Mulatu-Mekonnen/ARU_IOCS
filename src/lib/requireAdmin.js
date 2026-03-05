import { getServerSession } from "next-auth"; // or your auth system
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized", status: 403 };
  }

  return { user: session.user };
}