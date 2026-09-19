import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata = { title: "Developer" };

export default async function DeveloperPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasPermission(user, "api_manage")) return null;

  return (
    <ComingSoon
      title="Developer"
      description="API keys, webhook endpoints, documentation and integration health for connecting your systems to the platform."
    />
  );
}