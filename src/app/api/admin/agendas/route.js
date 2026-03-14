import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyRole } from "@/lib/adminGuard";

const prisma = new PrismaClient();

// GET all agendas with office filter
export async function GET(request) {
  try {
    const auth = verifyRole(request, ["ADMIN", "HEAD", "STAFF", "VIEWER"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const officeId = searchParams.get("officeId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const skip = (page - 1) * pageSize;

    // build where clause depending on role
    const where = {};

    // HEAD sees agendas related to their office (sender or receiver)
    if (auth.user.role === "HEAD") {
      const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
      if (user.officeId) {
        where.OR = [
          { senderOfficeId: user.officeId },
          { receiverOfficeId: user.officeId },
        ];
      } else {
        // if head without office, return empty
        where.id = null;
      }
      if (status) where.status = status;
      // ignore officeId filter for HEAD because it is already limited
    }

    // STAFF sees only agendas they created
    if (auth.user.role === "STAFF") {
      where.createdById = auth.user.id;
      if (status) where.status = status;
      // office filter ignored
    }

    // VIEWER sees only approved agendas, can filter by office
    if (auth.user.role === "VIEWER") {
      where.status = "APPROVED";
      if (officeId) {
        where.OR = [
          { senderOfficeId: officeId },
          { receiverOfficeId: officeId },
        ];
      }
      if (status) {
        // override status filter but keep APPROVED only
        where.status = "APPROVED";
      }
    }

    // ADMIN gets full access, apply query params normally
    if (auth.user.role === "ADMIN") {
      if (officeId) where.senderOfficeId = officeId;
      if (status) where.status = status;
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
    console.error("ADMIN AGENDA ERROR:", error);
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = verifyRole(request, ["ADMIN", "HEAD", "STAFF"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // determine sender office from user record
    let senderOfficeId = null;
    if (auth.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: auth.user.id },
      });
      senderOfficeId = user?.officeId || null;
    }

    const newAgenda = await prisma.agenda.create({
      data: {
        title: body.title,
        description: body.description,
        senderOfficeId,
        receiverOfficeId: body.receiverOfficeId || null,
        currentOfficeId: body.receiverOfficeId || senderOfficeId,
        createdById: auth.user.id,
        status: "PENDING",
        // if client already uploaded file and passed metadata
        attachmentUrl: body.attachmentUrl || null,
        attachmentName: body.attachmentName || null,
        attachmentSize: body.attachmentSize || null,
      },
    });

    // record create + send actions
    await prisma.approvalHistory.createMany({
      data: [
        {
          agendaId: newAgenda.id,
          action: "CREATE",
          actionById: auth.user.id,
          comment: "Agenda created",
        },
        {
          agendaId: newAgenda.id,
          action: "SEND",
          actionById: auth.user.id,
          comment: body.receiverOfficeId
            ? `Sent to office ${body.receiverOfficeId}`
            : "Sent",
        },
      ],
    });

    return NextResponse.json(newAgenda);
  } catch (error) {
    console.error("CREATE AGENDA ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}