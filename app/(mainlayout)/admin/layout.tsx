import { requireAdmin } from "@/lib/auth-helpers";
import { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This will redirect non-admin users
  await requireAdmin();

  return <>{children}</>;
}
