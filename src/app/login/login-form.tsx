"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input, Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { loginAction, type ActionResult } from "@/app/actions/auth";
import { useLocale } from "@/lib/locale";

const initialState: ActionResult = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const router = useRouter();
  const { toast } = useToast();
  const { dict } = useLocale();

  useEffect(() => {
    if (state?.ok) {
      toast(dict.common.somethingWentWrong, "success");
      router.refresh();
    }
  }, [state, router, toast, dict]);

  return (
    <form action={formAction} className="card-surface space-y-5 p-6 sm:p-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{dict.auth.welcomeBack}</h1>
        <p className="text-sm text-muted-foreground">{dict.auth.loginSubtitle}</p>
      </div>

      <Field label={dict.auth.email} htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
      </Field>

      <Field label={dict.auth.password} htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </Field>

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-950/30 dark:text-red-200">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
        {dict.auth.signIn}
      </Button>

      <div className="text-center">
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          {dict.auth.forgotPassword}
        </Link>
      </div>
    </form>
  );
}