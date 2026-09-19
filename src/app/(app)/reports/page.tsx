import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasPermission(user, "reports_read")) return null;

  return (
    <ComingSoon
      title="Reports"
      description="Performance dashboards, daily/weekly summaries, exception trends and exportable delivery analytics."
    />
  );
}