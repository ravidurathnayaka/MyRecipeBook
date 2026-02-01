import { z } from "zod";

/**
 * Environment variables schema
 * All environment variables must be validated at startup
 */
const envSchema = z.object({
  // Database (required)
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // NextAuth
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters").optional(),
  AUTH_URL: z.string().url().optional().or(z.literal("")),
  AUTH_TRUST_HOST: z.union([z.string().transform((val) => val === "true"), z.boolean()]).optional(),

  // Google OAuth (optional in development, required in production)
  AUTH_GOOGLE_ID: z.string().min(1).optional(),
  AUTH_GOOGLE_SECRET: z.string().min(1).optional(),

  // Optional: Super Admin email
  SUPER_ADMIN_EMAIL: z.string().email().optional(),

  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Optional: Sentry
  SENTRY_DSN: z.string().url().optional(),

  // Optional: Logging
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

/**
 * Validate and export environment variables
 * This will throw an error at startup if any required env vars are missing or invalid
 */
function getEnv() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isDevelopment = nodeEnv === "development";

  try {
    const parsed = envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      AUTH_SECRET: process.env.AUTH_SECRET,
      AUTH_URL: process.env.AUTH_URL,
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
      AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
      SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
      NODE_ENV: nodeEnv,
      SENTRY_DSN: process.env.SENTRY_DSN,
      LOG_LEVEL: process.env.LOG_LEVEL || "info",
    });

    // Warn in development if critical vars are missing
    if (isDevelopment) {
      if (!parsed.DATABASE_URL) {
        console.warn("⚠️  WARNING: DATABASE_URL is not set. Database operations will fail.");
      }
      if (!parsed.AUTH_GOOGLE_ID || !parsed.AUTH_GOOGLE_SECRET) {
        console.warn("⚠️  WARNING: Google OAuth credentials not set. Authentication will not work.");
      }
    }

    // Production: require AUTH_SECRET and Google OAuth
    if (!isDevelopment) {
      if (!parsed.AUTH_SECRET) {
        throw new Error("AUTH_SECRET is required in production. Generate with: openssl rand -base64 32");
      }
      if (!parsed.AUTH_GOOGLE_ID || !parsed.AUTH_GOOGLE_SECRET) {
        throw new Error("AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET are required in production for authentication");
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("\n");
      const errorMessage = `❌ Invalid environment variables:\n${missingVars}\n\n` +
        `Please check your .env file and ensure all required variables are set.\n` +
        `See .env.example for reference.`;

      // In development, warn instead of throwing (unless DATABASE_URL is missing)
      if (isDevelopment && process.env.DATABASE_URL) {
        console.error(errorMessage);
        console.warn("⚠️  Continuing in development mode, but some features may not work.");
        // Return a partial env object for development
        return {
          DATABASE_URL: process.env.DATABASE_URL || "",
          AUTH_SECRET: process.env.AUTH_SECRET,
          AUTH_URL: process.env.AUTH_URL,
          AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST === "true",
          AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
          AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
          SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
          NODE_ENV: nodeEnv as "development" | "production" | "test",
          SENTRY_DSN: process.env.SENTRY_DSN,
          LOG_LEVEL: (process.env.LOG_LEVEL || "info") as "debug" | "info" | "warn" | "error",
        };
      }

      throw new Error(errorMessage);
    }
    throw error;
  }
}

export const env = getEnv();
