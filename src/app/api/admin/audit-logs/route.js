import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/lib/requireAdmin";

export async function GET() {
  try {
    await roleGuard("ADMIN");

    const logs = [];

    // Get approval history logs
    const approvalLogs = await prisma.approvalHistory.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        actionBy: { select: { name: true, email: true, role: true } },
        agenda: { select: { title: true } },
      },
    });

    approvalLogs.forEach((log) => {
      logs.push({
        id: `approval_${log.id}`,
        timestamp: log.createdAt,
        user: log.actionBy?.email || log.actionBy?.name || "Unknown",
        userRole: log.actionBy?.role || "Unknown",
        action: log.action,
        details: `${log.agenda?.title || "Agenda"} - ${log.comment || "No details"}`,
        category: "Approval",
      });
    });

    // Get user creation/update logs
    const userLogs = await prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        office: { select: { name: true } }
      },
    });

    userLogs.forEach((user) => {
      logs.push({
        id: `user_created_${user.id}`,
        timestamp: user.createdAt,
        user: user.email,
        userRole: user.role,
        action: "USER_CREATED",
        details: `Created user account: ${user.name} (${user.role})${user.office ? ` in ${user.office.name}` : ''}`,
        category: "User Management",
      });
    });

    // Get office creation logs
    const officeLogs = await prisma.office.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    officeLogs.forEach((office) => {
      logs.push({
        id: `office_created_${office.id}`,
        timestamp: office.createdAt,
        user: "System Admin",
        userRole: "ADMIN",
        action: "OFFICE_CREATED",
        details: `Created office: ${office.name}`,
        category: "Office Management",
      });
    });

    // Get announcement creation logs
    const announcementLogs = await prisma.announcement.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, email: true, role: true } },
      },
    });

    announcementLogs.forEach((announcement) => {
      logs.push({
        id: `announcement_created_${announcement.id}`,
        timestamp: announcement.createdAt,
        user: announcement.author?.email || announcement.author?.name || "Unknown",
        userRole: announcement.author?.role || "Unknown",
        action: "ANNOUNCEMENT_CREATED",
        details: `Posted announcement: ${announcement.title}`,
        category: "Communications",
      });
    });

    // Get agenda creation logs
    const agendaLogs = await prisma.agenda.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { name: true, email: true, role: true } },
        senderOffice: { select: { name: true } },
        receiverOffice: { select: { name: true } },
      },
    });

    agendaLogs.forEach((agenda) => {
      logs.push({
        id: `agenda_created_${agenda.id}`,
        timestamp: agenda.createdAt,
        user: agenda.createdBy?.email || agenda.createdBy?.name || "Unknown",
        userRole: agenda.createdBy?.role || "Unknown",
        action: "AGENDA_CREATED",
        details: `Created communication: ${agenda.title}${agenda.senderOffice ? ` from ${agenda.senderOffice.name}` : ''}${agenda.receiverOffice ? ` to ${agenda.receiverOffice.name}` : ''}`,
        category: "Communications",
      });
    });

    // Sort all logs by timestamp (most recent first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Take the most recent 100 entries
    const recentLogs = logs.slice(0, 100);

    return NextResponse.json(recentLogs);
  } catch (err) {
    const status = err?.status || 500;
    const message = err?.message || "Server error";
    return NextResponse.json({ error: message }, { status });
  }
}
