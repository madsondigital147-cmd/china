"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useLocale } from "@/lib/locale";
import { useTheme } from "@/lib/theme";
import { SUPPORTED_LOCALES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/tracking", key: "nav.tracking" },
  { href: "/services", key: "nav.services" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export function LocaleSwitcher({ compact }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" aria-hidden />
        {!compact && <span>{locale.toUpperCase()}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-40 rounded-lg border bg-card p-1 shadow-lift">
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onMouseDown={() => setLocale(l.code)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm",
                l.code === locale ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
              )}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex h-9 items-center rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

export function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { dict } = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label={dict.brand.name}>
          <Logo />
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {dict.nav[link.key as keyof typeof dict.nav] as string}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-1 lg:flex">
          <LocaleSwitcher />
          <ThemeToggle />
          <Link href="/tracking">
            <Button variant="outline" size="sm" className="ml-1">
              {dict.nav.trackShipment}
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="ml-1">
              {dict.nav.login}
            </Button>
          </Link>
        </div>

        {/* mobile toggle */}
        <div className="flex items-center gap-1 lg:hidden">
          <LocaleSwitcher compact />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {menuOpen && (
        <nav className="border-t lg:hidden" aria-label="Mobile primary">
          <div className="container-app flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                {dict.nav[link.key as keyof typeof dict.nav] as string}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/tracking" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" className="w-full" size="lg">
                  {dict.nav.trackShipment}
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button className="w-full" size="lg">
                  {dict.nav.login}
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}