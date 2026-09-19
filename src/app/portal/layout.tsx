import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.roleCode !== "CUSTOMER") redirect("/dashboard");

  return <div className="min-h-screen bg-background">{children}</div>;
}