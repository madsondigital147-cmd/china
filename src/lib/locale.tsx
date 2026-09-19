"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getDictionary, type Dictionary, type Locale } from "@/i18n";

interface LocaleContextValue {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const dict = getDictionary(locale);

  useEffect(() => {
    const stored = (localStorage.getItem("nexus-locale") as Locale) || initialLocale;
    if (stored) setLocaleState(stored);
  }, [initialLocale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("nexus-locale", next);
  };

  return (
    <LocaleContext.Provider value={{ locale, dict, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}