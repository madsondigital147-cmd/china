import { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Logo } from "@/components/brand/Logo";
import {
  ArrowRight,
  PackageSearch,
  ShieldCheck,
  Globe2,
  Warehouse,
  DoorOpen,
  ShoppingCart,
  Radar,
  Package,
} from "lucide-react";
import { RouteMap } from "@/components/home/route-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

export const metadata: Metadata = {
  title: "Nexus Global Logistics — International shipping from China",
  description:
    "Global logistics, connected from China. International express shipping, reliable tracking and intelligent logistics solutions.",
  alternates: { canonical: "/" },
};

const SERVICES = [
  { icon: Package, title: "International Express", description: "Fast air shipping from China to destinations worldwide with priority handling." },
  { icon: Globe2, title: "Global Shipping", description: "Complete end-to-end shipping solutions across borders and continents." },
  { icon: Warehouse, title: "China Fulfillment", description: "Receive, store and dispatch your products directly from China." },
  { icon: DoorOpen, title: "Door-to-Door Delivery", description: "From our facility in China straight to your customer's door." },
  { icon: ShoppingCart, title: "E-commerce Logistics", description: "Optimized shipping operations for online stores and marketplaces." },
  { icon: Radar, title: "Worldwide Tracking", description: "Follow every shipment from China to final delivery in real time." },
];

const STEPS = [
  { n: "01", title: "Create shipment", description: "Register your shipment and recipient details." },
  { n: "02", title: "Package received", description: "We receive your package at our origin facility." },
  { n: "03", title: "Processing in China", description: "Package is processed and prepared for dispatch." },
  { n: "04", title: "International dispatch", description: "Shipment departs from China to its destination." },
  { n: "05", title: "Destination country", description: "Shipment arrives in the destination country." },
  { n: "06", title: "Final delivery", description: "Shipment is delivered to the recipient." },
];

export default function HomePage() {
  // Demo/placeholder metrics — configurable from admin settings (spec §11)
  const stats = [
    { label: "Global destinations", value: "40+" },
    { label: "International shipments", value: "—" },
    { label: "Logistics partners", value: "—" },
    { label: "Countries served", value: "—" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-navy text-white">
          <div className="absolute inset-0 opacity-[0.15]" aria-hidden>
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-electric blur-3xl" />
            <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-techblue-600 blur-3xl" />
          </div>
          <div className="container-app relative py-20 sm:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-blue-100">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  From China to the world
                </span>
                <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Global logistics.
                  <br />
                  <span className="text-electric-500">From China to the world.</span>
                </h1>
                <p className="mt-5 max-w-xl text-lg text-blue-100/80">
                  International shipping, reliable tracking and intelligent logistics solutions.
                </p>

                <form action="/tracking" className="mt-8 flex w-full max-w-lg gap-2" role="search">
                  <label htmlFor="tracking-hero" className="sr-only">
                    Tracking number
                  </label>
                  <Input
                    id="tracking-hero"
                    name="trackingNumber"
                    placeholder="Enter your tracking number"
                    className="h-12 border-white/20 bg-white/10 text-white placeholder:text-blue-100/50 focus-visible:outline-electric"
                  />
                  <Button size="lg" className="h-12 shrink-0 bg-electric-500 hover:bg-electric-400 text-white">
                    Track shipment
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </form>

                <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-blue-100/70">
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure handling
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Radar className="h-4 w-4 text-electric-500" /> Reliable tracking
                  </span>
                </div>
              </div>

              <RouteMap className="mx-auto w-full max-w-md lg:max-w-none" />
            </div>
          </div>
        </section>

        {/* how it works */}
        <section className="container-app py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">From creation to final delivery, every step is tracked.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="card-surface card-hover p-6">
                <span className="text-sm font-bold text-primary">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* services */}
        <section className="bg-muted/50 py-16 sm:py-20">
          <div className="container-app">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Logistics services</h2>
              <p className="mt-3 text-muted-foreground">Complete solutions from China to destinations worldwide.</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service) => (
                <Link key={service.title} href="/services" className="card-surface card-hover group p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <service.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold group-hover:text-primary">{service.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{service.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* stats — demo markers */}
        <section className="container-app py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Nexus in numbers</h2>
            <p className="mt-3 text-muted-foreground">Demo metrics — configured from the admin panel.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="card-surface p-6 text-center">
                <p className="text-3xl font-bold tracking-tight text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground">
              Demo data — replace in Settings → Branding
            </span>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy py-16 text-white sm:py-20">
          <div className="container-app flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="max-w-xl text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to ship from China?
              </h2>
              <p className="mt-3 text-blue-100/80">
                Create your shipment or request a quote. Our operations team in China is ready.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="bg-white text-navy hover:bg-blue-50">
                  Create shipment
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  className="border border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  Contact us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}