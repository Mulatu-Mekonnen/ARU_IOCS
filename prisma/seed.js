const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

await prisma.user.createMany({
  data: [
    {
      name: "System Admin",
      email: "admin@office.com",
      password: adminPassword,
      role: "ADMIN",
      office: "Head Office",
    },
    {
      name: "Office Staff",
      email: "staff@office.com",
      password: userPassword,
      role: "OFFICE_STAFF",
      office: "Branch Office",
    },
  ],
});

  console.log("✅ Users created successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());