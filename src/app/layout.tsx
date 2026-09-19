import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import { LocaleProvider } from "@/lib/locale";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegistry } from "@/components/pwa/registry";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Nexus Global Logistics — Global logistics. From China to the world.",
    template: "%s · Nexus Global Logistics",
  },
  description:
    "International shipping, reliable tracking and intelligent logistics solutions from China to the world.",
  keywords: ["logistics", "shipping", "tracking", "China", "international express", "fulfillment"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Nexus Global Logistics",
    title: "Nexus Global Logistics",
    description: "Global logistics, connected from China.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexus Global Logistics",
    description: "Global logistics, connected from China.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#071A2F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={cn("min-h-screen font-sans antialiased", inter.variable)}>
        <ThemeProvider>
          <LocaleProvider>
            <Toaster>{children}</Toaster>
            <PwaRegistry />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}