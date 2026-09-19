import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function normalizeTrackingInput(value: string) {
  return value.trim().toUpperCase();
}

export function formatNumber(value: number, locale = "en") {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

export function formatCurrency(value: number | string | null | undefined, currency = "USD", locale = "en") {
  const n = typeof value === "string" ? parseFloat(value) : value ?? 0;
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
}

export function formatWeight(kg: number | string | null | undefined, locale = "en") {
  const n = typeof kg === "string" ? parseFloat(kg) : kg ?? 0;
  return `${formatNumber(n, locale)} kg`;
}

export function formatDate(date: Date | string | null | undefined, timezone = "Asia/Shanghai", locale = "en") {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(d);
}

export function formatDateShort(date: Date | string | null | undefined, timezone = "Asia/Shanghai", locale = "en") {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: timezone,
  }).format(d);
}

export function timeAgo(date: Date | string, now = new Date(), locale = "en") {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (seconds < 60) return rtf.format(-seconds, "second");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  if (days < 30) return rtf.format(-days, "day");
  const months = Math.floor(days / 30);
  return rtf.format(-months, "month");
}

export function truncate(value: string, length: number) {
  if (value.length <= length) return value;
  return `${value.slice(0, length)}…`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function maskSecret(secret: string | null | undefined) {
  if (!secret) return "———";
  if (secret.length <= 8) return "••••••••";
  return `${secret.slice(0, 4)}•••••${secret.slice(-4)}`;
}

export function isValidIsoCountry(code: string) {
  return /^[A-Z]{2}$/.test(code.toUpperCase());
}

export function isValidPhone(value: string) {
  return /^\+?[0-9\s()-]{7,20}$/.test(value.trim());
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}