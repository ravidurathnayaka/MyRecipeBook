import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";
import { logger } from "./logger";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["error"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Graceful shutdown
if (typeof window === "undefined") {
  process.on("beforeExit", async () => {
    logger.info("Closing database connection");
    await prisma.$disconnect();
  });
}

export default prisma;
