import { redirect } from "next/navigation";
import { auth } from "./auth";
import { AuthenticationError } from "./errors";

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    // In API routes, throw an error instead of redirecting
    // The redirect() function throws a NEXT_REDIRECT error which doesn't work well in API routes
    throw new AuthenticationError("Authentication required");
  }

  return session.user;
}

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return session.user;
}
