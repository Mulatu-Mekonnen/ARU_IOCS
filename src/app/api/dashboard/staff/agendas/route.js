import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/adminGuard";

export async function GET(request) {
  try {
    const auth = verifyRole(request, ["STAFF"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const inbox = searchParams.get("inbox") === "true";
    const sent = searchParams.get("sent") === "true";
    const archived = searchParams.get("archive") === "true";
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * pageSize;

    let where = {};

    // STAFF can see items related to their own communication or their office
    const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (inbox) {
      where.receiverOfficeId = user.officeId || null;
    }

    if (sent) {
      where.createdById = user.id;
    }

    // Archive by default = non-pending if not explicit inbox/sent
    if (archived) {
      where.status = { in: ["APPROVED", "REJECTED", "FORWARDED", "ARCHIVED"] };
    }

    // If a custom status is provided, override the default archive selection
    if (status) {
      where.status = status;
    }

    // Search from title/description
    if (search) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (startDate) {
      where.createdAt = where.createdAt || {};
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt = where.createdAt || {};
      where.createdAt.lte = new Date(endDate);
    }

    // If no filters make sense, by default show staff-owned communications for sent/inbox
    if (!inbox && !sent && !archived && !status && !search) {
      where.createdById = auth.user.id;
    }

    const [agendas, total] = await Promise.all([
      prisma.agenda.findMany({
        where,
        include: {
          createdBy: true,
          senderOffice: true,
          receiverOffice: true,
          currentOffice: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.agenda.count({ where }),
    ]);

    return NextResponse.json({ agendas, total, page, pageSize });
  } catch (error) {
    console.error("STAFF AGENDAS ERROR:", error);
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}