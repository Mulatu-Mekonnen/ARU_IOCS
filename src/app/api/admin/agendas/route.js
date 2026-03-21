import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyRole } from "@/lib/adminGuard";

const prisma = new PrismaClient();

// Helper function to get settings
async function getSettings() {
  const settings = await prisma.setting.findMany();
  const settingsObj = {};
  settings.forEach((s) => {
    if (s.value === "true") settingsObj[s.key] = true;
    else if (s.value === "false") settingsObj[s.key] = false;
    else if (!isNaN(s.value) && s.value !== "") settingsObj[s.key] = parseInt(s.value);
    else settingsObj[s.key] = s.value;
  });
  return settingsObj;
}

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
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const skip = (page - 1) * pageSize;

    const allowedStatuses = ["PENDING", "APPROVED", "REJECTED", "FORWARDED", "ARCHIVED"];
    const normalizedStatus = allowedStatuses.includes(status) ? status : null;

    // build where clause depending on role
    const where = {};

    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // HEAD sees agendas related to their office (sender or receiver)
    if (auth.user.role === "HEAD") {
      const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
      if (user.officeId) {
        const officeConstraint = {
          OR: [
            { senderOfficeId: user.officeId },
            { receiverOfficeId: user.officeId },
            { currentOfficeId: user.officeId },
          ],
        };

        if (where.OR) {
          // combine search OR with office OR via AND
          where.AND = [{ OR: where.OR }, officeConstraint];
          delete where.OR;
        } else {
          Object.assign(where, officeConstraint);
        }
      } else {
        // if head without office, return empty
        where.id = null;
      }
      if (normalizedStatus) where.status = normalizedStatus;
    }

    if (auth.user.role === "VIEWER") {
      where.status = "APPROVED";
      if (officeId) {
        where.OR = [
          { senderOfficeId: officeId },
          { receiverOfficeId: officeId },
        ];
      }
      // always force APPROVED
      // ignore other status filters
    }

    // ADMIN gets full access, apply query params normally
    if (auth.user.role === "ADMIN") {
      if (officeId) where.senderOfficeId = officeId;
      if (normalizedStatus) where.status = normalizedStatus;
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
    const settings = await getSettings();

    // Check file upload settings
    if (body.attachmentUrl && !settings.allowFileUploads) {
      return NextResponse.json({ error: "File uploads are currently disabled" }, { status: 400 });
    }

    if (body.attachmentSize && body.attachmentSize > (settings.maxFileSize * 1024 * 1024)) {
      return NextResponse.json({ 
        error: `File size exceeds maximum limit of ${settings.maxFileSize}MB` 
      }, { status: 400 });
    }

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
        status: settings.requireApprovalForAll ? "PENDING" : "APPROVED",
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