/**
 * Lightweight i18n — dictionary based, ready to expand (spec §60).
 * EN/PT/中文 shipped; FR/ES/IT/JA ready to add as new files.
 */
import en from "./locales/en";
import pt from "./locales/pt";
import zh from "./locales/zh";

export type Locale = "en" | "pt" | "zh";
export type Dictionary = typeof en;

export const dictionaries = {
  en,
  pt,
  zh,
} as unknown as Record<Locale, Dictionary>;

export const SUPPORTED_LOCALES: Locale[] = ["en", "pt", "zh"];

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "pt" || value === "zh";
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export function getDictionaryFirst(text: string, locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

const LEGACY_MESSAGES: Record<string, Partial<Dictionary>> = {
  en: {},
  pt: {},
  zh: {},
};

export function resolveMessage(dict: Dictionary, key: string, params?: Record<string, string | number>): string {
  let value: string = key;
  const segments = key.split(".");
  let cursor: unknown = dict;
  for (const segment of segments) {
    if (cursor && typeof cursor === "object" && segment in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[segment];
    } else {
      cursor = undefined;
      break;
    }
  }
  if (typeof cursor === "string") value = cursor;
  else value = key.replace(/\./g, " ");

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return value;
}

export const localeNames: Record<Locale, string> = {
  en: "English",
  pt: "Português",
  zh: "中文",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  pt: "🇧🇷",
  zh: "🇨🇳",
};