"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Code2,
  LifeBuoy,
  Shield,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { logoutAction } from "@/app/actions/auth";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shipments", label: "Shipments", icon: Package },
  { href: "/shipments/new", label: "Create shipment", icon: PlusCircle },
  { href: "/tracking", label: "Tracking", icon: Radar },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/carriers", label: "Carriers", icon: Building2 },
  { href: "/warehouse", label: "Warehouse", icon: Warehouse },
  { href: "/exceptions", label: "Exceptions", icon: AlertTriangle },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

const MORE_NAV: NavItem[] = [
  { href: "/developer", label: "Developer", icon: Code2 },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/audit-logs", label: "Audit logs", icon: Shield },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/shipments") return pathname === "/shipments" || (pathname.startsWith("/shipments/") && pathname !== "/shipments/new");
  if (href === "/tracking") return pathname === "/tracking" || pathname.startsWith("/tracking/");
  return pathname.startsWith(href);
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch {
      toast("Signed out.", "success");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo tone="light" />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        {MAIN_NAV.map((item) => (
          <SideLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}
        <div className="my-3 border-t border-white/10" />
        {MORE_NAV.map((item) => (
          <SideLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href="/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--sidebar-foreground)] hover:bg-white/5 hover:text-white"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-white">
            U
          </div>
          Profile
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 px-3 text-[var(--sidebar-foreground)] hover:bg-white/5 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden />
          Logout
        </Button>
      </div>
    </div>
  );
}

function SideLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isNavActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-primary/15 text-white" : "text-[var(--sidebar-foreground)] hover:bg-white/5 hover:text-white",
      )}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
      {item.label}
    </Link>
  );
}

export function AppShell({
  children,
  userName,
  roleLabel,
  notifications = 0,
}: {
  children: React.ReactNode;
  userName?: string;
  roleLabel?: string;
  notifications?: number;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[var(--sidebar)] lg:flex" aria-label="Sidebar">
        <SideNav />
      </aside>

      {/* mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[var(--sidebar)] shadow-lift">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--sidebar-foreground)] hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SideNav onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="text-sm font-semibold text-navy dark:text-white">
              NEXUS <span className="text-primary">LOGISTICS</span>
            </span>
          </Link>
          <Link
            href="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                {notifications > 9 ? "9+" : notifications}
              </span>
            )}
          </Link>
        </header>

        {/* mobile bottom nav (spec §56) */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Bottom navigation">
          <div className="grid grid-cols-5">
            <BottomLink href="/dashboard" label="Home" icon={LayoutDashboard} pathname={pathname} />
            <BottomLink href="/shipments" label="Shipments" icon={Package} pathname={pathname} />
            <BottomLink href="/tracking" label="Tracking" icon={Radar} pathname={pathname} />
            <BottomLink href="/notifications" label="Alerts" icon={Bell} pathname={pathname} />
            <BottomLink href="/more" label="More" icon={Menu} pathname={pathname} />
          </div>
        </nav>

        <main className="flex-1 pb-24 lg:pb-0">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function BottomLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  pathname: string;
}) {
  const active = isNavActive(pathname, href);
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
      {label}
    </Link>
  );
}