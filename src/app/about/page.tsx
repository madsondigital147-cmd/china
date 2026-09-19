import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { LogoMark } from "@/components/brand/Logo";
import { ShieldCheck, Radar, Globe2, Cpu, MapPin, } from "lucide-react";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Nexus Global Logistics is an international logistics technology company with operational origin in China, serving customers worldwide.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust",
    description: "Clear processes, honest status updates and data we never fabricate.",
  },
  {
    icon: Radar,
    title: "Speed",
    description: "Efficient handling from origin in China to final delivery.",
  },
  {
    icon: Globe2,
    title: "International scale",
    description: "Routing and compliance expertise across borders and continents.",
  },
  {
    icon: Cpu,
    title: "Technology",
    description: "A logistics platform built in-house, from tracking to integrations.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="bg-navy py-16 text-white sm:py-20">
          <div className="container-app max-w-3xl">
            <LogoMark className="h-12 w-12" />
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Global logistics, connected from China.
            </h1>
            <p className="mt-5 text-lg text-blue-100/80">
              Nexus Global Logistics is an international logistics technology company with operational origin in
              China. We connect Chinese operations with customers and destinations worldwide through technology,
              precision and scale.
            </p>
          </div>
        </section>

        <section className="container-app py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="card-surface p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <v.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted/50 py-16">
          <div className="container-app grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Our operations</h2>
              <p className="mt-3 text-muted-foreground">
                Our operational center coordinates receiving, processing and international dispatch in China. From
                there, shipments are handed to logistics partners for the final delivery leg, while our platform
                maintains full visibility across the journey.
              </p>
              <p className="mt-3 text-muted-foreground">
                Every shipment carries an internal shipment ID. A real carrier tracking number is always
                distinguished from demo or internal identifiers — we never present fabricated tracking as a real
                carrier event.
              </p>
            </div>
            <div className="card-surface p-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <h3 className="font-semibold">Operational center</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Shanghai, China
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Placeholder office information — configured from admin settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}