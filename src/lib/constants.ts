/**
 * Reference data — countries (ISO 3166-1 alpha-2), currencies (ISO 4217),
 * timezones. Single source so the UI never hand-crafts these locally.
 */

export interface Country {
  code: string; // ISO alpha-2
  name: string;
  dialCode: string;
  region: string;
}

export const COUNTRIES: Country[] = [
  { code: "CN", name: "China", dialCode: "+86", region: "Asia" },
  { code: "BR", name: "Brazil", dialCode: "+55", region: "South America" },
  { code: "US", name: "United States", dialCode: "+1", region: "North America" },
  { code: "CA", name: "Canada", dialCode: "+1", region: "North America" },
  { code: "MX", name: "Mexico", dialCode: "+52", region: "North America" },
  { code: "FR", name: "France", dialCode: "+33", region: "Europe" },
  { code: "DE", name: "Germany", dialCode: "+49", region: "Europe" },
  { code: "IT", name: "Italy", dialCode: "+39", region: "Europe" },
  { code: "ES", name: "Spain", dialCode: "+34", region: "Europe" },
  { code: "PT", name: "Portugal", dialCode: "+351", region: "Europe" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", region: "Europe" },
  { code: "NL", name: "Netherlands", dialCode: "+31", region: "Europe" },
  { code: "BE", name: "Belgium", dialCode: "+32", region: "Europe" },
  { code: "CH", name: "Switzerland", dialCode: "+41", region: "Europe" },
  { code: "AT", name: "Austria", dialCode: "+43", region: "Europe" },
  { code: "SE", name: "Sweden", dialCode: "+46", region: "Europe" },
  { code: "NO", name: "Norway", dialCode: "+47", region: "Europe" },
  { code: "DK", name: "Denmark", dialCode: "+45", region: "Europe" },
  { code: "FI", name: "Finland", dialCode: "+358", region: "Europe" },
  { code: "PL", name: "Poland", dialCode: "+48", region: "Europe" },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", region: "Europe" },
  { code: "IE", name: "Ireland", dialCode: "+353", region: "Europe" },
  { code: "GR", name: "Greece", dialCode: "+30", region: "Europe" },
  { code: "JP", name: "Japan", dialCode: "+81", region: "Asia" },
  { code: "KR", name: "South Korea", dialCode: "+82", region: "Asia" },
  { code: "SG", name: "Singapore", dialCode: "+65", region: "Asia" },
  { code: "MY", name: "Malaysia", dialCode: "+60", region: "Asia" },
  { code: "TH", name: "Thailand", dialCode: "+66", region: "Asia" },
  { code: "VN", name: "Vietnam", dialCode: "+84", region: "Asia" },
  { code: "PH", name: "Philippines", dialCode: "+63", region: "Asia" },
  { code: "ID", name: "Indonesia", dialCode: "+62", region: "Asia" },
  { code: "IN", name: "India", dialCode: "+91", region: "Asia" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", region: "Middle East" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", region: "Middle East" },
  { code: "IL", name: "Israel", dialCode: "+972", region: "Middle East" },
  { code: "TR", name: "Türkiye", dialCode: "+90", region: "Middle East" },
  { code: "AU", name: "Australia", dialCode: "+61", region: "Oceania" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", region: "Oceania" },
  { code: "AR", name: "Argentina", dialCode: "+54", region: "South America" },
  { code: "CL", name: "Chile", dialCode: "+56", region: "South America" },
  { code: "CO", name: "Colombia", dialCode: "+57", region: "South America" },
  { code: "PE", name: "Peru", dialCode: "+51", region: "South America" },
  { code: "UY", name: "Uruguay", dialCode: "+598", region: "South America" },
  { code: "PY", name: "Paraguay", dialCode: "+595", region: "South America" },
  { code: "ZA", name: "South Africa", dialCode: "+27", region: "Africa" },
  { code: "NG", name: "Nigeria", dialCode: "+234", region: "Africa" },
  { code: "EG", name: "Egypt", dialCode: "+20", region: "Africa" },
  { code: "MA", name: "Morocco", dialCode: "+212", region: "Africa" },
  { code: "RU", name: "Russia", dialCode: "+7", region: "Europe" },
  { code: "UA", name: "Ukraine", dialCode: "+380", region: "Europe" },
  { code: "HK", name: "Hong Kong SAR", dialCode: "+852", region: "Asia" },
  { code: "TW", name: "Taiwan", dialCode: "+886", region: "Asia" },
];

export const COUNTRY_MAP = new Map(COUNTRIES.map((c) => [c.code, c]));

export function countryName(code: string | null | undefined): string {
  if (!code) return "—";
  return COUNTRY_MAP.get(code.toUpperCase())?.name ?? code.toUpperCase();
}

export function countryDialCode(code: string | null | undefined): string {
  if (!code) return "+00";
  return COUNTRY_MAP.get(code.toUpperCase())?.dialCode ?? "+00";
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", locale: "zh-CN" },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE" },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", locale: "pt-BR" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
];

export const CURRENCY_MAP = new Map(CURRENCIES.map((c) => [c.code, c]));

export const TIMEZONES = [
  "Asia/Shanghai",
  "UTC",
  "America/Sao_Paulo",
  "America/New_York",
  "America/Los_Angeles",
  "America/Mexico_City",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Lisbon",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Singapore",
  "Australia/Sydney",
  "Africa/Johannesburg",
];

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export const APP_NAME = "Nexus Global Logistics";
export const APP_SLOGAN = "Global logistics. From China to the world.";
export const SERVICE_EMAIL = "support@nexuslogistics.example";
export const SERVICE_PHONE = "+86 021 0000 0000";
export const CHINA_OFFICE_CITY = "Shanghai, China";
export const SUPPORTED_TRACKING_URL = "/tracking";