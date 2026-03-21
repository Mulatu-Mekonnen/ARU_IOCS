const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const headPassword = await bcrypt.hash("1234", 10);
  const staffPassword = await bcrypt.hash("user123", 10);
  const viewerPassword = await bcrypt.hash("1234", 10);

  // create some offices
  const headOffice = await prisma.office.create({ data: { name: "Head Office" } });
  const branchOffice = await prisma.office.create({ data: { name: "Branch Office" } });

  // create users
  await prisma.user.createMany({
    data: [
      {
        name: "System Admin",
        email: "admin@office.com",
        password: adminPassword,
        role: "ADMIN",
        officeId: headOffice.id,
      },
      {
        name: "Head User",
        email: "gute@g",
        password: headPassword,
        role: "HEAD",
        officeId: headOffice.id,
      },
      {
        name: "Office Staff",
        email: "staff@office.com",
        password: staffPassword,
        role: "STAFF",
        officeId: branchOffice.id,
      },
      {
        name: "Viewer User",
        email: "namste@G",
        password: viewerPassword,
        role: "VIEWER",
        officeId: branchOffice.id,
      },
    ],
  });

  console.log("✅ Users and offices created successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());