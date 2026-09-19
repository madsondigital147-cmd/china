import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { AppShell } from "@/components/layout/app-shell";
import { ROLE_LABELS } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Customers use the portal instead of the admin dashboard
  if (user.roleCode === "CUSTOMER") redirect("/portal");

  return (
    <AppShell userName={user.name} roleLabel={ROLE_LABELS[user.roleCode] ?? user.roleCode}>
      {children}
    </AppShell>
  );
}