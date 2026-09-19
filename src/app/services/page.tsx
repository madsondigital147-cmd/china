import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  Package,
  Globe2,
  Warehouse,
  DoorOpen,
  ShoppingCart,
  Radar,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Logistics services",
  description:
    "International Express, Global Shipping, China Fulfillment, Door-to-Door Delivery, E-commerce Logistics and Worldwide Tracking — from China to the world.",
  alternates: { canonical: "/services" },
};

const SERVICES = [
  {
    icon: Package,
    title: "International Express",
    description:
      "Fast air shipping from China to destinations worldwide with priority handling. Ideal for urgent shipments and time-sensitive goods.",
    points: ["Priority air route", "Export packaging", "Customs documentation support"],
  },
  {
    icon: Globe2,
    title: "Global Shipping",
    description:
      "Complete end-to-end shipping solutions across borders and continents, with consolidated multi-carrier routing.",
    points: ["Multi-carrier network", "Borders and customs expertise", "Consolidated shipments"],
  },
  {
    icon: Warehouse,
    title: "China Fulfillment",
    description:
      "Receive, store and dispatch your products directly from China with our operational hub handling your inventory.",
    points: ["Receiving and storage", "Pick and pack", "Dispatch from China"],
  },
  {
    icon: DoorOpen,
    title: "Door-to-Door Delivery",
    description:
      "From our facility in China straight to your customer's door, with complete visibility across every leg.",
    points: ["Single point of contact", "Full journey visibility", "Delivery confirmation"],
  },
  {
    icon: ShoppingCart,
    title: "E-commerce Logistics",
    description:
      "Optimized shipping operations for online stores and marketplaces, integrated through our API.",
    points: ["API integration", "Order reference tracking", "Customer-facing tracking"],
  },
  {
    icon: Radar,
    title: "Worldwide Tracking",
    description:
      "Follow every shipment from China to final delivery through a clear, reliable tracking interface.",
    points: ["Status timeline", "Event-level visibility", "Mobile friendly"],
  },
];

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="bg-navy py-16 text-white sm:py-20">
          <div className="container-app">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Logistics services</h1>
            <p className="mt-4 max-w-2xl text-lg text-blue-100/80">
              Complete solutions from China to destinations worldwide. Technology-driven logistics built for
              international trade.
            </p>
          </div>
        </section>

        <section className="container-app py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <Card key={s.title} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">{s.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  <ul className="mt-4 space-y-1.5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-muted/50 py-14">
          <div className="container-app flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Need a custom solution?</h2>
              <p className="mt-1 text-muted-foreground">Talk to our operations team about your shipping volume.</p>
            </div>
            <Link
              href="/contact"
              className="btn btn-primary btn-lg"
            >
              Contact us
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}