import prisma from "@/lib/db";

async function main() {
  // Get email from command line arguments or use default
  const emailArg = process.argv[2];
  const superAdminEmail = emailArg || process.env.SUPER_ADMIN_EMAIL || "admin@example.com";

  if (!emailArg && !process.env.SUPER_ADMIN_EMAIL) {
    console.warn(
      "⚠️  No email provided. Using default: admin@example.com\n" +
      "   Usage: pnpm create-admin <email> or set SUPER_ADMIN_EMAIL env variable"
    );
  }

  try {
    const superAdmin = await prisma.user.upsert({
      where: { email: superAdminEmail },
      update: { role: "SUPER_ADMIN" },
      create: {
        email: superAdminEmail,
        name: "Super Admin",
        role: "SUPER_ADMIN",
      },
    });

    console.log("✅ Super Admin created/updated successfully!");
    console.log("   Email:", superAdmin.email);
    console.log("   Role:", superAdmin.role);
    console.log("   ID:", superAdmin.id);
  } catch (error: any) {
    if (error.code === "P2002") {
      console.error("❌ Error: Email already exists");
    } else {
      console.error("❌ Error creating super admin:", error.message);
    }
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
