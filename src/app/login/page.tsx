import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { Logo } from "@/components/brand/Logo";
import { Input, Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link href="/register" className="link">
              Create account
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo admin: <code className="rounded bg-muted px-1 py-0.5">admin@demo.local</code>
          </p>
        </div>
      </main>
    </div>
  );
}