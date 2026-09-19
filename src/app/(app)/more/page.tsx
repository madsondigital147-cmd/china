import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Radar,
  Users,
  Building2,
  Warehouse,
  AlertTriangle,
  BarChart3,
  Bell,
  Code2,
  LifeBuoy,
  Shield,
  Settings,
  User,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "More" };

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
}

const ITEMS: Item[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shipments", label: "Shipments", icon: Package },
  { href: "/shipments/new", label: "Create shipment", icon: PlusCircle },
  { href: "/tracking", label: "Tracking", icon: Radar },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/carriers", label: "Carriers", icon: Building2 },
  { href: "/warehouse", label: "Warehouse", icon: Warehouse },
  { href: "/exceptions", label: "Exceptions", icon: AlertTriangle },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/audit-logs", label: "Audit logs", icon: Shield },
  { href: "/developer", label: "Developer", icon: Code2 },
  { href: "/webhooks", label: "Webhooks", icon: FileText },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MorePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">More</h1>
        <p className="page-subtitle">Everything in one place.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ITEMS.map((item) => (
          <Card key={item.href} className="card-hover">
            <Link href={item.href} className="block p-4">
              <CardContent className="flex flex-col items-center gap-2 p-0 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" aria-hidden />
                </div>
                <span className="text-xs font-medium leading-tight">{item.label}</span>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}