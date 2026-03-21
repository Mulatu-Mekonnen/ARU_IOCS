const { PrismaClient } = require('@prisma/client');

async function checkData() {
  const prisma = new PrismaClient();
  try {
    const agendaCount = await prisma.agenda.count();
    const userCount = await prisma.user.count();
    const officeCount = await prisma.office.count();

    console.log(`Database status:`);
    console.log(`- Agendas: ${agendaCount}`);
    console.log(`- Users: ${userCount}`);
    console.log(`- Offices: ${officeCount}`);

    if (agendaCount > 0) {
      const sampleAgenda = await prisma.agenda.findFirst({
        select: { id: true, title: true, status: true }
      });
      console.log(`Sample agenda: ${sampleAgenda?.id} - ${sampleAgenda?.title} (${sampleAgenda?.status})`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();