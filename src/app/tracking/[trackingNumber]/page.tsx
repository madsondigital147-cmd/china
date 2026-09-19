import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { TrackingTimeline } from "@/components/tracking/timeline";
import { StatusBadge } from "@/components/ui/badge";
import { StatusIcon } from "@/components/tracking/timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getShipmentByTracking } from "@/services/shipment";
import { countryName } from "@/lib/constants";
import { formatDate, formatWeight, formatCurrency, normalizeTrackingInput } from "@/lib/utils";
import { STATUSES } from "@/lib/status";
import { SearchX, TriangleAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Tracking result",
  robots: { index: false, follow: false }, // spec §78 — noindex private info
};

interface Props {
  params: Promise<{ trackingNumber: string }>;
}

export default async function TrackingResultPage({ params }: Props) {
  const { trackingNumber } = await params;
  const normalized = normalizeTrackingInput(trackingNumber);
  const shipment = await getShipmentByTracking(normalized);

  if (!shipment || shipment.trackingNumber === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <PublicHeader />
        <main className="flex flex-1 flex-col items-center justify-center bg-muted/30 px-4 py-16 text-center">
          <div className="mx-auto max-w-md">
            <SearchX className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
            <h1 className="mt-5 text-2xl font-bold tracking-tight">Tracking number not found.</h1>
            <p className="mt-2 text-muted-foreground">Please verify the tracking number and try again.</p>
            <form action="/tracking" className="mt-6 flex gap-2">
              <Input
                name="trackingNumber"
                placeholder="Enter your tracking number"
                defaultValue={normalized}
                className="h-11"
              />
              <Button type="submit" className="h-11 shrink-0">
                Track
              </Button>
            </form>
            <Link href="/tracking" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
              Search another tracking number
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const lastEvent = shipment.events.at(-1);
  const delivered = shipment.status === "DELIVERED";

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 bg-muted/30 py-10 sm:py-14">
        <div className="container-app max-w-5xl">
          {/* search bar */}
          <form action="/tracking" className="mb-8 flex w-full gap-2" role="search">
            <label htmlFor="tracking-re" className="sr-only">
              Tracking number
            </label>
            <Input
              id="tracking-re"
              name="trackingNumber"
              placeholder="Enter your tracking number"
              defaultValue={normalized}
              className="h-12 bg-background text-base"
            />
            <Button type="submit" className="h-12 shrink-0">
              Track
            </Button>
          </form>

          {shipment.isDemo && (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-200">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                This tracking data is a demo. It does not represent a real shipment.
              </p>
            </div>
          )}

          {/* summary card */}
          <Card className="overflow-hidden">
            <div className="border-b bg-gradient-to-r from-techblue-600 to-electric p-5 text-white sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-100">
                    Status
                  </p>
                  <div className="mt-1 flex items-center gap-2.5">
                    <StatusIcon
                      status={shipment.status}
                      className="h-6 w-6 text-white"
                    />
                    <span className="text-2xl font-bold">{STATUSES[shipment.status].label}</span>
                  </div>
                  {lastEvent && (
                    <p className="mt-1 text-xs text-blue-100">
                      {lastEvent.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-100">
                    Last updated
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {formatDate(shipment.updatedAt)}
                  </p>
                </div>
              </div>

              {/* tracking numbers */}
              <div className="mt-5 grid gap-4 border-t border-white/15 pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-100">Tracking number</p>
                  <p className="mt-0.5 text-lg font-semibold tracking-wide">{shipment.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-100">Shipment ID</p>
                  <p className="mt-0.5 text-lg font-semibold tracking-wide">{shipment.shipmentNumber}</p>
                </div>
              </div>
            </div>

            <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 lg:grid-cols-4">
              <Detail label="Origin" value={`${shipment.senderAddress?.city ?? "China"}, ${countryName(shipment.senderAddress?.countryCode)}`} />
              <Detail
                label="Destination"
                value={`${shipment.recipientAddress?.city ?? ""}, ${countryName(shipment.recipientAddress?.countryCode)}`}
              />
              <Detail label="Recipient" value={maskName(shipment.recipientAddress?.name)} />
              <Detail label="Carrier" value={shipment.carrier?.name ?? "—"} />
              <Detail label="Service" value={shipment.service?.name ?? "—"} />
              <Detail label="Estimated delivery" value={formatEstimate(shipment.estimatedDeliveryEnd)} />
              <Detail
                label="Package"
                value={shipment.packageData ? `${formatWeight(Number(shipment.packageData.weightKg))} · ${Number(shipment.packageData.lengthCm)}×${Number(shipment.packageData.widthCm)}×${Number(shipment.packageData.heightCm)} cm` : "—"}
              />
              <Detail
                label="Declared value"
                value={shipment.packageData ? formatCurrency(Number(shipment.packageData.declaredValue), shipment.packageData.currency) : "—"}
              />
              <Detail label="Created" value={formatDate(shipment.createdAt)} />
            </CardContent>
          </Card>

          {/* timeline */}
          <div className="mt-8">
            <h2 className="mb-5 text-xl font-bold tracking-tight">Tracking timeline</h2>
            <Card>
              <CardContent className="p-5 sm:p-6">
                {shipment.events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tracking events yet.</p>
                ) : (
                  <TrackingTimeline
                    events={shipment.events.map((e) => ({
                      status: e.status,
                      description: e.description,
                      location: [e.location, e.city].filter(Boolean).join(" · ") || null,
                      occurredAt: e.occurredAt,
                      isCurrent: e.id === lastEvent?.id,
                    }))}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );

  function Detail({ label, value }: { label: string; value: string }) {
    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    );
  }

  // Public page: show only the first letter of each name part ("Thiago Rodrigues" -> "T***** R********").
  function maskName(name: string | null | undefined) {
    if (!name) return "—";
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0] + "*".repeat(Math.max(part.length - 1, 1)))
      .join(" ");
  }

  function formatEstimate(date: Date | null | undefined) {
    if (!date) return "—";
    return formatDate(date);
  }
}