import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/adminGuard";

export async function GET(request) {
  try {
    const auth = verifyRole(request, ["HEAD"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Get the HEAD user's office
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { id: true, name: true, officeId: true, office: { select: { name: true } } }
    });

    if (!user?.officeId) {
      return NextResponse.json({ error: "User not assigned to an office" }, { status: 403 });
    }

    const officeId = user.officeId;

    // Get recent activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get agendas relevant to this HEAD's office
    const relevantAgendas = await prisma.agenda.findMany({
      where: {
        OR: [
          { senderOfficeId: officeId },
          { receiverOfficeId: officeId },
          { currentOfficeId: officeId }
        ],
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        createdBy: {
          select: { name: true },
        },
        senderOffice: {
          select: { name: true },
        },
        receiverOffice: {
          select: { name: true },
        },
        currentOffice: {
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    // Transform data into notifications
    const notifications = [];

    relevantAgendas.forEach((agenda) => {
      // New agenda received for approval
      if (agenda.receiverOfficeId === officeId && agenda.status === 'PENDING') {
        notifications.push({
          id: `agenda_received_${agenda.id}`,
          type: 'new_communication',
          title: 'New Communication Received',
          message: `A new communication "${agenda.title}" requires your approval.`,
          timestamp: agenda.createdAt,
          read: false,
          priority: 'high',
          actionUrl: `/dashboard/head/detail/${agenda.id}`,
          metadata: {
            agendaId: agenda.id,
            status: agenda.status,
          },
        });
      }

      // Agenda created by staff in this office
      if (agenda.senderOfficeId === officeId) {
        notifications.push({
          id: `agenda_created_${agenda.id}`,
          type: 'communication_created',
          title: 'Communication Created',
          message: `"${agenda.title}" was created by ${agenda.createdBy.name} from your office.`,
          timestamp: agenda.createdAt,
          read: false,
          priority: 'medium',
          actionUrl: `/dashboard/head/detail/${agenda.id}`,
          metadata: {
            agendaId: agenda.id,
            status: agenda.status,
          },
        });
      }

      // Status change notifications for agendas this HEAD has acted on
      agenda.approvalHistories.forEach((history) => {
        if (history.actionById === auth.user.id) {
          let type, title, message, priority;

          switch (history.action) {
            case 'APPROVED':
              type = 'approval_update';
              title = 'Communication Approved';
              message = `You approved "${agenda.title}".`;
              priority = 'low';
              break;
            case 'REJECTED':
              type = 'rejected_communication';
              title = 'Communication Rejected';
              message = `You rejected "${agenda.title}".`;
              priority = 'medium';
              break;
            case 'FORWARDED':
              type = 'forwarded_communication';
              title = 'Communication Forwarded';
              message = `You forwarded "${agenda.title}" to ${agenda.currentOffice?.name || 'another office'}.`;
              priority = 'medium';
              break;
            default:
              return;
          }

          notifications.push({
            id: `action_${history.id}`,
            type,
            title,
            message,
            timestamp: history.createdAt,
            read: false,
            priority,
            actionUrl: `/dashboard/head/detail/${agenda.id}`,
            metadata: {
              agendaId: agenda.id,
              action: history.action,
              comment: history.comment,
            },
          });
        }
      });

      // Agenda forwarded to this office
      if (agenda.currentOfficeId === officeId && agenda.status === 'FORWARDED') {
        const latestForward = agenda.approvalHistories.find(h => h.action === 'FORWARDED');
        if (latestForward && latestForward.actionById !== auth.user.id) {
          notifications.push({
            id: `agenda_forwarded_to_office_${agenda.id}`,
            type: 'communication_forwarded',
            title: 'Communication Forwarded to Your Office',
            message: `"${agenda.title}" was forwarded to your office by ${latestForward.actionBy.name}.`,
            timestamp: latestForward.createdAt,
            read: false,
            priority: 'high',
            actionUrl: `/dashboard/head/detail/${agenda.id}`,
            metadata: {
              agendaId: agenda.id,
              forwardedBy: latestForward.actionBy.name,
            },
          });
        }
      }
    });

    // Add pending reminder if there are pending approvals
    const pendingCount = await prisma.agenda.count({
      where: {
        receiverOfficeId: officeId,
        status: 'PENDING'
      }
    });

    if (pendingCount > 0) {
      notifications.push({
        id: `pending_reminder_${Date.now()}`,
        type: 'pending_reminder',
        title: 'Pending Approvals Reminder',
        message: `You have ${pendingCount} communication${pendingCount > 1 ? 's' : ''} waiting for approval.`,
        timestamp: new Date(),
        read: false,
        priority: pendingCount > 5 ? 'high' : 'medium',
        actionUrl: '/dashboard/head/pending',
        metadata: {
          pendingCount,
        },
      });
    }

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
    console.error("HEAD notifications error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}