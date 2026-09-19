"use client";

import { useActionState } from "react";
import { Input, Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { registerAction, type ActionResult } from "@/app/actions/auth";
import { useLocale } from "@/lib/locale";

const initialState: ActionResult = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const { dict } = useLocale();

  return (
    <form action={formAction} className="card-surface space-y-5 p-6 sm:p-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{dict.auth.register}</h1>
        <p className="text-sm text-muted-foreground">{dict.auth.registerSubtitle}</p>
      </div>

      <Field label={dict.auth.name} htmlFor="name">
        <Input id="name" name="name" autoComplete="name" required placeholder="Jane Smith" />
      </Field>

      <Field label={dict.auth.email} htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
      </Field>

      <Field label={dict.auth.password} htmlFor="password" hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-950/30 dark:text-red-200">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
        {dict.auth.createAccount}
      </Button>
    </form>
  );
}