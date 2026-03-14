import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyRole } from "@/lib/adminGuard";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  // return full agenda including history
  const auth = verifyRole(request, ["ADMIN", "HEAD", "STAFF", "VIEWER"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const agenda = await prisma.agenda.findUnique({
    where: { id: params.id },
    include: {
      createdBy: true,
      senderOffice: true,
      receiverOffice: true,
      currentOffice: true,
      approvalHistories: { include: { actionBy: true } },
      routes: { include: { fromOffice: true, toOffice: true, routedBy: true } },
    },
  });
  if (!agenda) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // enforce role-specific visibility
  if (auth.user.role === "HEAD") {
    const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
    if (agenda.senderOfficeId !== user.officeId && agenda.receiverOfficeId !== user.officeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  if (auth.user.role === "STAFF") {
    if (agenda.createdById !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  if (auth.user.role === "VIEWER") {
    if (agenda.status !== "APPROVED") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(agenda);
}

export async function PATCH(request, { params }) {
  try {
    const auth = verifyRole(request, ["ADMIN", "HEAD"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { action, comment, receiverOfficeId } = await request.json();
    const valid = ["approve", "reject", "forward"];
    if (!valid.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // load existing agenda for permission check
    const agenda = await prisma.agenda.findUnique({ where: { id: params.id } });
    if (!agenda) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // HEAD can only act on agendas received by their office and only if pending
    if (auth.user.role === "HEAD") {
      const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
      if (agenda.receiverOfficeId !== user.officeId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (agenda.status !== "PENDING") {
        return NextResponse.json({ error: "Agenda already processed" }, { status: 400 });
      }
    }

    let status;
    const data = {};

    if (action === "approve") {
      status = "APPROVED";
    }
    if (action === "reject") {
      status = "REJECTED";
    }
    if (action === "forward") {
      status = "FORWARDED";
      if (receiverOfficeId) {
        data.receiverOfficeId = receiverOfficeId;
        data.currentOfficeId = receiverOfficeId;
      }
    }
    data.status = status;

    const updated = await prisma.agenda.update({
      where: { id: params.id },
      data,
    });

    // record history
    await prisma.approvalHistory.create({
      data: {
        agendaId: params.id,
        action: action.toUpperCase(),
        comment,
        actionById: auth.user.id,
      },
    });

    // insert routing record when forwarding
    if (action === "forward") {
      const agenda = await prisma.agenda.findUnique({ where: { id: params.id } });
      if (agenda) {
        await prisma.agendaRoute.create({
          data: {
            agendaId: params.id,
            fromOfficeId: agenda.currentOfficeId || agenda.senderOfficeId,
            toOfficeId: receiverOfficeId,
            routedById: auth.user.id,
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE AGENDA ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}