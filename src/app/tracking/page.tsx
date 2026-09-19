import { Metadata } from "next";
import { redirect } from "next/navigation";
import { normalizeTrackingInput } from "@/lib/utils";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Input } from "@/components/ui/field";
import { Button as Btn } from "@/components/ui/button";
import { PackageSearch } from "lucide-react";

export const metadata: Metadata = {
  title: "Track your shipment",
  description: "Enter your tracking number to see the latest status of your shipment.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/tracking" },
};

interface Props {
  searchParams: Promise<{ trackingNumber?: string | string[] }>;
}

export default async function TrackingPage({ searchParams }: Props) {
  const { trackingNumber } = await searchParams;
  const code = normalizeTrackingInput(Array.isArray(trackingNumber) ? trackingNumber[0] ?? "" : trackingNumber ?? "");
  if (code) redirect(`/tracking/${encodeURIComponent(code)}`);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 bg-muted/30">
        <section className="container-app py-12 sm:py-16">
          <div className="mx-auto max-w-xl text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-primary" aria-hidden />
            <h1 className="mt-4 text-3xl font-bold tracking-tight">Track your shipment</h1>
            <p className="mt-2 text-muted-foreground">
              Enter your tracking number to see the latest status.
            </p>

            <form action="/tracking" className="mt-8 flex w-full gap-2" role="search">
              <label htmlFor="tracking-input" className="sr-only">
                Tracking number
              </label>
              <Input
                id="tracking-input"
                name="trackingNumber"
                placeholder="Enter your tracking number"
                className="h-12 text-base"
                autoFocus
              />
              <Btn type="submit" className="h-12 shrink-0">Track</Btn>
            </form>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}