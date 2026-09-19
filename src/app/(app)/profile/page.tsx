import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/rbac";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const fields = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Role", value: ROLE_LABELS[user.roleCode] ?? user.roleCode },
    { label: "Language", value: user.language },
    { label: "Timezone", value: user.timezone },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">Your account details</p>

      <Card>
        <CardHeader>
          <CardTitle>Account information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
              {initials(user.name)}
            </div>
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.label} className="flex items-center justify-between gap-3 border-b pb-2 text-sm">
                <dt className="text-muted-foreground">{f.label}</dt>
                <dd className="font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <p className="mt-4 text-sm text-muted-foreground">
        Editing your language, timezone and notifications is available in{" "}
        <Link href="/settings" className="font-medium text-primary hover:underline">
          Settings
        </Link>
        .
      </p>
    </div>
  );
}