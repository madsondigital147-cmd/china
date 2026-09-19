import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata = { title: "Support" };

export default async function SupportPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasPermission(user, "support_manage")) return null;

  return (
    <ComingSoon
      title="Support"
      description="Customer support tickets, replies and internal notes to keep every shipment moving."
    />
  );
}