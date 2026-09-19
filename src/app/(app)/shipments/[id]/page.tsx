import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { getShipmentById } from "@/services/shipment";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { TrackingTimeline } from "@/components/tracking/timeline";
import { ShipmentActions } from "./shipment-actions";
import { STATUSES, STATUS_FLOW, eventSourceLabel } from "@/lib/status";
import { countryName } from "@/lib/constants";
import { formatDate, formatWeight, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Boxes, Bell, FileText, HardDrive, ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shipment detail" };

type Params = Promise<{ id: string }>;

export default async function ShipmentDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const shipment = await getShipmentById(id, user.organizationId);
  if (!shipment) notFound();

  const canUpdate = hasPermission(user, "shipment_update");
  const canCancel = hasPermission(user, "shipment_cancel");
  const latestAt = shipment.events[shipment.events.length - 1]?.occurredAt ?? shipment.createdAt;

  const statusOptions = STATUS_FLOW.map((s) => ({ value: s, label: STATUSES[s].label }));

  const timelineEvents = shipment.events.map((e, idx) => ({
    status: e.status,
    description: e.description,
    location: [e.city, e.location].filter(Boolean).join(", ") || null,
    occurredAt: e.occurredAt,
    isCurrent: idx === shipment.events.length - 1,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div>
        <Link
          href="/shipments"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to shipments
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="page-title">{shipment.shipmentNumber}</h1>
            <StatusBadge status={shipment.status} />
            {shipment.isDemo && <Badge color="amber">DEMO</Badge>}
          </div>
          <ShipmentActions
            shipmentId={shipment.id}
            currentStatus={shipment.status}
            statusOptions={statusOptions}
            canUpdate={canUpdate}
            canCancel={canCancel}
            hasTracking={!!shipment.trackingNumber}
            isDemo={shipment.isDemo}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {shipment.reference && (
            <>
              Reference: <span className="font-medium">{shipment.reference}</span> ·{" "}
            </>
          )}
          Created {formatDate(shipment.createdAt, user.timezone)} by {shipment.createdBy?.name ?? "system"}
        </p>
        {shipment.isDemo && (
          <p className="mt-2 max-w-2xl text-xs text-amber-600">
            This is a demo shipment. Its tracking number is not a real carrier tracking number.
          </p>
        )}
      </div>

      {/* key facts strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact label="Tracking number" value={shipment.trackingNumber ?? "—"} mono={!!shipment.trackingNumber} />
        <Fact label="Destination" value={
          shipment.recipientAddress
            ? `${shipment.recipientAddress.city}, ${countryName(shipment.recipientAddress.countryCode)}`
            : "—"
        } />
        <Fact label="Carrier" value={shipment.carrier?.name ?? "—"} />
        <Fact label="Last event" value={formatDate(latestAt, user.timezone)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* left column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* addresses */}
          <div className="grid gap-4 sm:grid-cols-2">
            <AddressCard title="Sender" address={shipment.senderAddress} />
            <AddressCard title="Recipient" address={shipment.recipientAddress} />
          </div>

          {/* package data */}
          {shipment.packageData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-muted-foreground" aria-hidden />
                  Package
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                  <Datum label="Weight" value={formatWeight(Number(shipment.packageData.weightKg))} />
                  <Datum label="Dimensions" value={`${Number(shipment.packageData.lengthCm)}×${Number(shipment.packageData.widthCm)}×${Number(shipment.packageData.heightCm)} cm`} />
                  <Datum label="Quantity" value={String(shipment.packageData.quantity)} />
                  <Datum
                    label="Declared value"
                    value={formatCurrency(Number(shipment.packageData.declaredValue), shipment.packageData.currency ?? "USD")}
                  />
                  {shipment.packageData.description && (
                    <div className="col-span-2 sm:col-span-4">
                      <Datum label="Description" value={shipment.packageData.description} />
                    </div>
                  )}
                  {shipment.shippingMethod && <Datum label="Method" value={shipment.shippingMethod} />}
                  <Datum label="Priority" value={shipment.isPriority ? "Priority" : "Standard"} />
                  {shipment.service && <Datum label="Service" value={shipment.service.name} />}
                </div>
              </CardContent>
            </Card>
          )}

          {/* timeline */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-muted-foreground" aria-hidden />
                Tracking timeline
              </CardTitle>
              <span className="text-xs text-muted-foreground">{shipment.events.length} events</span>
            </CardHeader>
            <CardContent>
              {timelineEvents.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No tracking events yet.</p>
              ) : (
                <TrackingTimeline events={timelineEvents} timezone={user.timezone} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* right column */}
        <div className="flex flex-col gap-6">
          {/* labels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
                Labels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shipment.labels.length === 0 ? (
                <p className="text-sm text-muted-foreground">No labels generated.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {shipment.labels.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-2 py-2">
                      <span className="font-mono text-xs">{l.barcodeValue ?? "Label"}</span>
                      <StatusBadge status={l.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* docs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" aria-hidden />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shipment.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents attached.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {shipment.documents.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-2 py-2">
                      <span className="truncate">{d.name}</span>
                      <span className="text-xs text-muted-foreground">{d.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* source breakdown (debug) */}
          <div className="rounded-card border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">
              <Bell className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              Integration status
            </p>
            <ul className="mt-2 space-y-1">
              <li>Source of last event: {shipment.events[shipment.events.length - 1] ? eventSourceLabel(shipment.events[shipment.events.length - 1].source) : "—"}</li>
              <li>Carrier sync: {shipment.carrier?.lastSyncAt ? formatDate(shipment.carrier.lastSyncAt, user.timezone) : "never"}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="card-surface p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={["mt-1 truncate text-sm font-semibold", mono ? "font-mono" : ""].join(" ")}>{value}</p>
    </div>
  );
}

function Datum({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function AddressCard({ title, address }: { title: string; address: { name: string | null; company: string | null; addressLine1: string | null; addressLine2: string | null; city: string | null; state: string | null; postalCode: string | null; countryCode: string | null } | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0.5 text-sm">
        {!address ? (
          <p className="text-muted-foreground">Not provided.</p>
        ) : (
          <>
            {address.company && <p className="font-medium">{address.company}</p>}
            <p className="font-medium">{address.name}</p>
            <p className="text-muted-foreground">{address.addressLine1}</p>
            {address.addressLine2 && <p className="text-muted-foreground">{address.addressLine2}</p>}
            <p className="text-muted-foreground">
              {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
            </p>
            <p className="text-muted-foreground">{countryName(address.countryCode)}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}