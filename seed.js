const { PrismaClient } = require("./generated/prisma");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = "manojfa4451e@gmail.com"; // Make sure this matches your login email
  const hashedPassword = await bcrypt.hash("Manoj@1705", 10);

  await prisma.admin.upsert({
    where: { email: email },
    update: {
      password: hashedPassword, // This allows you to reset your password by running the script
    },
    create: {
      email: email,
      password: hashedPassword,
    },
  });
  console.log("Admin record synchronized successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());