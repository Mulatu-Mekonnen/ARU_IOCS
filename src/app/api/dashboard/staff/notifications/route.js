import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/adminGuard";

export async function GET(request) {
  try {
    const auth = verifyRole(request, ["STAFF"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      include: { office: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const relevantAgendas = await prisma.agenda.findMany({
      where: {
        OR: [
          { receiverOfficeId: user.officeId },
          { senderOfficeId: user.officeId },
          { createdById: user.id },
        ],
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        createdBy: { select: { name: true } },
        senderOffice: { select: { name: true } },
        receiverOffice: { select: { name: true } },
        currentOffice: { select: { name: true } },
        approvalHistories: {
          include: { actionBy: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const notifications = [];

    for (const agenda of relevantAgendas) {
      if (agenda.receiverOfficeId === user.officeId && agenda.status === "PENDING") {
        notifications.push({
          id: `new_communication_${agenda.id}`,
          type: "new_communication",
          title: "New Communication Received",
          message: `A new communication \"${agenda.title}\" is pending your approval.`,
          timestamp: agenda.createdAt,
          read: false,
          priority: "high",
          actionUrl: `/dashboard/staff/inbox`,
          metadata: { agendaId: agenda.id },
        });
      }

      if (agenda.createdById === user.id && agenda.approvalHistories.length > 0) {
        const latestAction = agenda.approvalHistories[0];
        if (latestAction.action === "APPROVED") {
          notifications.push({
            id: `approved_${agenda.id}`,
            type: "approval_update",
            title: "Communication Approved",
            message: `Your communication \"${agenda.title}\" was approved.`,
            timestamp: latestAction.createdAt,
            read: false,
            priority: "medium",
            actionUrl: `/dashboard/staff/sent`,
            metadata: { agendaId: agenda.id },
          });
        }
        if (latestAction.action === "REJECTED") {
          notifications.push({
            id: `rejected_${agenda.id}`,
            type: "rejected_communication",
            title: "Communication Rejected",
            message: `Your communication \"${agenda.title}\" was rejected.`,
            timestamp: latestAction.createdAt,
            read: false,
            priority: "high",
            actionUrl: `/dashboard/staff/sent`,
            metadata: { agendaId: agenda.id, comment: latestAction.comment },
          });
        }
      }
    }

    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const highPriority = notifications.filter((n) => n.priority === "high" && !n.read).length;
    const today = notifications.filter((n) => {
      const t = new Date();
      return new Date(n.timestamp).toDateString() === t.toDateString();
    }).length;

    return NextResponse.json({ notifications: notifications.slice(0, 50), stats: { total, unread, highPriority, today } });
  } catch (err) {
    console.error("STAFF notifications error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}