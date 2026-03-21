import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await roleGuard("ADMIN");

    // Get recent agenda activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAgendas = await prisma.agenda.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        senderOffice: {
          select: { name: true },
        },
        receiverOffice: {
          select: { name: true },
        },
        approvedBy: {
          select: { name: true },
        },
        approvalHistories: {
          include: {
            actionBy: {
              select: { name: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // Get recent user registrations
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        office: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    // Get recent announcements
    const recentAnnouncements = await prisma.announcement.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        author: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Get recent office creations
    const recentOffices = await prisma.office.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Transform data into notifications
    const notifications = [];

    // Agenda notifications
    recentAgendas.forEach((agenda) => {
      // New agenda created
      notifications.push({
        id: `agenda_created_${agenda.id}`,
        type: 'new_agenda',
        title: 'New Communication Created',
        message: `"${agenda.title}" was created by ${agenda.createdBy.name}${agenda.senderOffice ? ` from ${agenda.senderOffice.name}` : ''}.`,
        timestamp: agenda.createdAt,
        read: false,
        priority: 'medium',
        actionUrl: `/dashboard/admin/agendas`,
        metadata: {
          agendaId: agenda.id,
          status: agenda.status,
        },
      });

      // Status change notifications
      if (agenda.approvalHistories.length > 0) {
        const latestAction = agenda.approvalHistories[0];
        let type, title, message, priority;

        switch (latestAction.action) {
          case 'APPROVED':
            type = 'agenda_approved';
            title = 'Communication Approved';
            message = `"${agenda.title}" was approved by ${latestAction.actionBy.name}.`;
            priority = 'low';
            break;
          case 'REJECTED':
            type = 'agenda_rejected';
            title = 'Communication Rejected';
            message = `"${agenda.title}" was rejected by ${latestAction.actionBy.name}.`;
            priority = 'high';
            break;
          case 'FORWARDED':
            type = 'agenda_forwarded';
            title = 'Communication Forwarded';
            message = `"${agenda.title}" was forwarded by ${latestAction.actionBy.name}.`;
            priority = 'medium';
            break;
          default:
            return;
        }

        notifications.push({
          id: `agenda_action_${agenda.id}_${latestAction.id}`,
          type,
          title,
          message,
          timestamp: latestAction.createdAt,
          read: false,
          priority,
          actionUrl: `/dashboard/admin/agendas`,
          metadata: {
            agendaId: agenda.id,
            action: latestAction.action,
            comment: latestAction.comment,
          },
        });
      }
    });

    // User registration notifications
    recentUsers.forEach((user) => {
      notifications.push({
        id: `user_created_${user.id}`,
        type: 'new_user',
        title: 'New User Registered',
        message: `${user.name} (${user.email}) joined as ${user.role}${user.office ? ` in ${user.office.name}` : ''}.`,
        timestamp: user.createdAt,
        read: false,
        priority: 'low',
        actionUrl: `/dashboard/admin/users`,
        metadata: {
          userId: user.id,
          role: user.role,
        },
      });
    });

    // Announcement notifications
    recentAnnouncements.forEach((announcement) => {
      notifications.push({
        id: `announcement_created_${announcement.id}`,
        type: 'new_announcement',
        title: 'New Announcement Posted',
        message: `"${announcement.title}" was posted by ${announcement.author.name}.`,
        timestamp: announcement.createdAt,
        read: false,
        priority: 'medium',
        actionUrl: `/dashboard/admin/announcements`,
        metadata: {
          announcementId: announcement.id,
        },
      });
    });

    // Office creation notifications
    recentOffices.forEach((office) => {
      notifications.push({
        id: `office_created_${office.id}`,
        type: 'new_office',
        title: 'New Office Created',
        message: `Office "${office.name}" has been added to the system.`,
        timestamp: office.createdAt,
        read: false,
        priority: 'low',
        actionUrl: `/dashboard/admin/offices`,
        metadata: {
          officeId: office.id,
        },
      });
    });

    // Sort notifications by timestamp (most recent first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get notification stats
    const totalNotifications = notifications.length;
    const unreadCount = notifications.filter(n => !n.read).length;
    const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length;
    const todayCount = notifications.filter(n => {
      const today = new Date();
      const notifDate = new Date(n.timestamp);
      return notifDate.toDateString() === today.toDateString();
    }).length;

    return NextResponse.json({
      notifications: notifications.slice(0, 50), // Limit to 50 most recent
      stats: {
        total: totalNotifications,
        unread: unreadCount,
        highPriority: highPriorityCount,
        today: todayCount,
      },
    });
  } catch (err) {
    console.error("Admin notifications error:", err);
    const status = err?.status || 500;
    const message = err?.message || (status === 403 ? "Forbidden" : "Server error");
    return NextResponse.json({ message }, { status });
  }
}