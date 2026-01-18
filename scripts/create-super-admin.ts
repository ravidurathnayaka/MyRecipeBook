import prisma from "@/app/utils/db";

async function main() {
  // Change this email to your email
  const superAdminEmail = "your-email@gmail.com";

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { role: "SUPER_ADMIN" },
    create: {
      email: superAdminEmail,
      name: "Super Admin",
      role: "SUPER_ADMIN",
    },
  });

  console.log("✅ Super Admin created/updated:", superAdmin);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
