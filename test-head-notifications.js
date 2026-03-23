const { PrismaClient } = require('@prisma/client');

async function testHeadNotifications() {
  const prisma = new PrismaClient();

  try {
    // Get a HEAD user
    const headUser = await prisma.user.findFirst({
      where: { role: 'HEAD' },
      select: { id: true, name: true, officeId: true, office: { select: { name: true } } }
    });

    if (!headUser) {
      console.log('No HEAD user found in database');
      return;
    }

    console.log('Testing HEAD notifications for user:', headUser.name, 'in office:', headUser.office?.name);

    // Get relevant agendas
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const relevantAgendas = await prisma.agenda.findMany({
      where: {
        OR: [
          { senderOfficeId: headUser.officeId },
          { receiverOfficeId: headUser.officeId },
          { currentOfficeId: headUser.officeId }
        ],
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        createdBy: { select: { name: true } },
        senderOffice: { select: { name: true } },
        receiverOffice: { select: { name: true } },
        currentOffice: { select: { name: true } },
        approvalHistories: {
          include: { actionBy: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`Found ${relevantAgendas.length} relevant agendas for this HEAD user`);

    // Count pending approvals
    const pendingCount = await prisma.agenda.count({
      where: {
        receiverOfficeId: headUser.officeId,
        status: 'PENDING'
      }
    });

    console.log(`Pending approvals: ${pendingCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testHeadNotifications();