import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LocaleSwitcher } from "./public-header";
import { APP_NAME, SERVICE_EMAIL, CHINA_OFFICE_CITY } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/services", label: "Services" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/tracking", label: "Tracking" },
      { href: "/login", label: "Login" },
      { href: "/register", label: "Create account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/policies", label: "Policies" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container-app py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              International express logistics, connected from China to the world.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Language:</span>
              <LocaleSwitcher compact />
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {APP_NAME}. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>{CHINA_OFFICE_CITY}</span>
            <span>{SERVICE_EMAIL}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}