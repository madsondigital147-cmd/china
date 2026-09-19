"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Field, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { createShipmentAction, type ShipmentResult } from "@/app/actions/shipments";
import { COUNTRIES, CURRENCIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CarrierOption {
  id: string;
  name: string;
  services: Array<{ id: string; name: string; code: string }>;
  isDemo: boolean;
}

export function CreateShipmentForm({ carriers }: { carriers: CarrierOption[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draft, setDraft] = useState<Record<string, string | number>>({});

  const set = (key: string, value: string | number) => setDraft((d) => ({ ...d, [key]: value }));

  const steps = [
    { label: "Sender", index: 0 },
    { label: "Recipient", index: 1 },
    { label: "Package", index: 2 },
    { label: "Service", index: 3 },
    { label: "Review", index: 4 },
  ];

  const canProceed = (idx: number) => {
    if (idx === 0) return !!(draft.senderName && draft.senderAddressLine1 && draft.senderCity && draft.senderCountry);
    if (idx === 1) return !!(draft.recipientName && draft.recipientAddressLine1 && draft.recipientCity && draft.recipientCountry);
    if (idx === 2) return !!(draft.weightKg && draft.lengthCm && draft.widthCm && draft.heightCm && draft.declaredValue);
    if (idx === 3) return !!(draft.carrierId && draft.serviceId);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res: ShipmentResult = await createShipmentAction({
        sender: {
          name: String(draft.senderName ?? ""),
          company: draft.senderCompany ? String(draft.senderCompany) : undefined,
          addressLine1: String(draft.senderAddressLine1 ?? ""),
          addressLine2: draft.senderAddressLine2 ? String(draft.senderAddressLine2) : undefined,
          city: String(draft.senderCity ?? ""),
          province: draft.senderProvince ? String(draft.senderProvince) : undefined,
          postalCode: draft.senderPostalCode ? String(draft.senderPostalCode) : undefined,
          countryCode: String(draft.senderCountry ?? "CN"),
          phone: draft.senderPhone ? String(draft.senderPhone) : undefined,
          email: draft.senderEmail ? String(draft.senderEmail) : undefined,
        },
        recipient: {
          name: String(draft.recipientName ?? ""),
          company: draft.recipientCompany ? String(draft.recipientCompany) : undefined,
          addressLine1: String(draft.recipientAddressLine1 ?? ""),
          addressLine2: draft.recipientAddressLine2 ? String(draft.recipientAddressLine2) : undefined,
          city: String(draft.recipientCity ?? ""),
          state: draft.recipientState ? String(draft.recipientState) : undefined,
          postalCode: draft.recipientPostalCode ? String(draft.recipientPostalCode) : undefined,
          countryCode: String(draft.recipientCountry ?? "BR"),
          phone: draft.recipientPhone ? String(draft.recipientPhone) : undefined,
          email: draft.recipientEmail ? String(draft.recipientEmail) : undefined,
        },
        package: {
          description: draft.packageDescription ? String(draft.packageDescription) : undefined,
          quantity: Number(draft.quantity ?? 1),
          weightKg: Number(draft.weightKg ?? 0),
          lengthCm: Number(draft.lengthCm ?? 0),
          widthCm: Number(draft.widthCm ?? 0),
          heightCm: Number(draft.heightCm ?? 0),
          declaredValue: Number(draft.declaredValue ?? 0),
          currency: String(draft.currency ?? "USD"),
        },
        service: draft.carrierId && draft.serviceId
          ? {
              carrierId: String(draft.carrierId),
              serviceId: String(draft.serviceId),
              isPriority: draft.isPriority === "true",
            }
          : undefined,
        reference: draft.reference ? String(draft.reference) : undefined,
      });

      if (res.ok && res.shipmentId) {
        toast("Shipment created successfully.");
        router.push(`/shipments/${res.shipmentId}`);
        router.refresh();
      } else {
        toast(res.error ?? "Unable to create shipment.", "error");
      }
    } catch {
      toast("Unable to create shipment.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCarrier = carriers.find((c) => c.id === String(draft.carrierId ?? ""));
  const totalWeight = Number(draft.weightKg ?? 0);

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
      {/* stepper */}
      <div className="mb-8 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {steps.map((s, i) => (
          <button
            key={s.index}
            type="button"
            onClick={() => i < step && setStep(i)}
            className="flex items-center gap-2 text-xs font-medium"
            aria-current={i === step ? "step" : undefined}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                i === step
                  ? "bg-primary text-white"
                  : i < step
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            <span className={cn("whitespace-nowrap", i === step ? "text-foreground" : "text-muted-foreground")}>
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* STEP 1: SENDER */}
      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" htmlFor="senderCompany">
            <Input id="senderCompany" value={draft.senderCompany ?? ""} onChange={(e) => set("senderCompany", e.target.value)} />
          </Field>
          <Field label="Name" htmlFor="senderName" required>
            <Input id="senderName" value={draft.senderName ?? ""} onChange={(e) => set("senderName", e.target.value)} />
          </Field>
          <Field label="Address" htmlFor="senderAddressLine1" required className="sm:col-span-2">
            <Input id="senderAddressLine1" value={draft.senderAddressLine1 ?? ""} onChange={(e) => set("senderAddressLine1", e.target.value)} />
          </Field>
          <Field label="Address 2" htmlFor="senderAddressLine2">
            <Input id="senderAddressLine2" value={draft.senderAddressLine2 ?? ""} onChange={(e) => set("senderAddressLine2", e.target.value)} />
          </Field>
          <Field label="City" htmlFor="senderCity" required>
            <Input id="senderCity" value={draft.senderCity ?? ""} onChange={(e) => set("senderCity", e.target.value)} />
          </Field>
          <Field label="Province" htmlFor="senderProvince">
            <Input id="senderProvince" value={draft.senderProvince ?? ""} onChange={(e) => set("senderProvince", e.target.value)} />
          </Field>
          <Field label="Postal code" htmlFor="senderPostalCode">
            <Input id="senderPostalCode" value={draft.senderPostalCode ?? ""} onChange={(e) => set("senderPostalCode", e.target.value)} />
          </Field>
          <Field label="Country" htmlFor="senderCountry" required>
            <Select id="senderCountry" value={String(draft.senderCountry ?? "CN")} onChange={(e) => set("senderCountry", e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.dialCode})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Phone" htmlFor="senderPhone">
            <Input id="senderPhone" value={draft.senderPhone ?? ""} onChange={(e) => set("senderPhone", e.target.value)} placeholder="+86 ..." />
          </Field>
          <Field label="Email" htmlFor="senderEmail">
            <Input id="senderEmail" type="email" value={draft.senderEmail ?? ""} onChange={(e) => set("senderEmail", e.target.value)} />
          </Field>
        </div>
      )}

      {/* STEP 2: RECIPIENT */}
      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="recipientName" required>
            <Input id="recipientName" value={draft.recipientName ?? ""} onChange={(e) => set("recipientName", e.target.value)} />
          </Field>
          <Field label="Company" htmlFor="recipientCompany">
            <Input id="recipientCompany" value={draft.recipientCompany ?? ""} onChange={(e) => set("recipientCompany", e.target.value)} />
          </Field>
          <Field label="Address" htmlFor="recipientAddressLine1" required className="sm:col-span-2">
            <Input id="recipientAddressLine1" value={draft.recipientAddressLine1 ?? ""} onChange={(e) => set("recipientAddressLine1", e.target.value)} />
          </Field>
          <Field label="Address 2" htmlFor="recipientAddressLine2">
            <Input id="recipientAddressLine2" value={draft.recipientAddressLine2 ?? ""} onChange={(e) => set("recipientAddressLine2", e.target.value)} />
          </Field>
          <Field label="City" htmlFor="recipientCity" required>
            <Input id="recipientCity" value={draft.recipientCity ?? ""} onChange={(e) => set("recipientCity", e.target.value)} />
          </Field>
          <Field label="State" htmlFor="recipientState">
            <Input id="recipientState" value={draft.recipientState ?? ""} onChange={(e) => set("recipientState", e.target.value)} />
          </Field>
          <Field label="Postal code" htmlFor="recipientPostalCode">
            <Input id="recipientPostalCode" value={draft.recipientPostalCode ?? ""} onChange={(e) => set("recipientPostalCode", e.target.value)} />
          </Field>
          <Field label="Country" htmlFor="recipientCountry" required>
            <Select id="recipientCountry" value={String(draft.recipientCountry ?? "BR")} onChange={(e) => set("recipientCountry", e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.dialCode})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Phone" htmlFor="recipientPhone">
            <Input id="recipientPhone" value={draft.recipientPhone ?? ""} onChange={(e) => set("recipientPhone", e.target.value)} placeholder="+55 ..." />
          </Field>
          <Field label="Email" htmlFor="recipientEmail">
            <Input id="recipientEmail" type="email" value={draft.recipientEmail ?? ""} onChange={(e) => set("recipientEmail", e.target.value)} />
          </Field>
        </div>
      )}

      {/* STEP 3: PACKAGE */}
      {step === 2 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Description" htmlFor="packageDescription" className="sm:col-span-2">
            <Textarea id="packageDescription" value={draft.packageDescription ?? ""} onChange={(e) => set("packageDescription", e.target.value)} placeholder="e.g. Electronics accessories" />
          </Field>
          <Field label="Quantity" htmlFor="quantity">
            <Input id="quantity" type="number" min={1} value={draft.quantity ?? 1} onChange={(e) => set("quantity", Number(e.target.value))} />
          </Field>
          <Field label="Weight (kg)" htmlFor="weightKg" required>
            <Input id="weightKg" type="number" step="0.001" min="0.001" value={draft.weightKg ?? ""} onChange={(e) => set("weightKg", Number(e.target.value))} />
          </Field>
          <Field label="Length (cm)" htmlFor="lengthCm" required>
            <Input id="lengthCm" type="number" step="0.1" min="0.1" value={draft.lengthCm ?? ""} onChange={(e) => set("lengthCm", Number(e.target.value))} />
          </Field>
          <Field label="Width (cm)" htmlFor="widthCm" required>
            <Input id="widthCm" type="number" step="0.1" min="0.1" value={draft.widthCm ?? ""} onChange={(e) => set("widthCm", Number(e.target.value))} />
          </Field>
          <Field label="Height (cm)" htmlFor="heightCm" required>
            <Input id="heightCm" type="number" step="0.1" min="0.1" value={draft.heightCm ?? ""} onChange={(e) => set("heightCm", Number(e.target.value))} />
          </Field>
          <Field label="Declared value" htmlFor="declaredValue" required>
            <Input id="declaredValue" type="number" step="0.01" min="0.01" value={draft.declaredValue ?? ""} onChange={(e) => set("declaredValue", Number(e.target.value))} />
          </Field>
          <Field label="Currency" htmlFor="currency">
            <Select id="currency" value={String(draft.currency ?? "USD")} onChange={(e) => set("currency", e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}

      {/* STEP 4: SERVICE */}
      {step === 3 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Carrier" htmlFor="carrierId" required className="sm:col-span-2">
            <Select id="carrierId" value={String(draft.carrierId ?? "")} onChange={(e) => { set("carrierId", e.target.value); set("serviceId", ""); }}>
              <option value="">Select a carrier…</option>
              {carriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.isDemo ? " (Demo)" : ""}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Service" htmlFor="serviceId" required className="sm:col-span-2">
            <Select id="serviceId" value={String(draft.serviceId ?? "")} onChange={(e) => set("serviceId", e.target.value)} disabled={!selectedCarrier}>
              <option value="">Select a service…</option>
              {selectedCarrier?.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Shipping method" htmlFor="shippingMethod">
            <Select id="shippingMethod" value={String(draft.shippingMethod ?? "air")} onChange={(e) => set("shippingMethod", e.target.value)}>
              <option value="air">Air</option>
              <option value="sea">Sea</option>
              <option value="courier">Courier</option>
              <option value="express">Express</option>
            </Select>
          </Field>
          <Field label="Priority" htmlFor="isPriority">
            <Select id="isPriority" value={String(draft.isPriority ?? "false")} onChange={(e) => set("isPriority", e.target.value)}>
              <option value="false">Standard</option>
              <option value="true">Priority</option>
            </Select>
          </Field>
          <Field label="Order reference" htmlFor="reference" className="sm:col-span-2">
            <Input id="reference" value={draft.reference ?? ""} onChange={(e) => set("reference", e.target.value)} placeholder="ORD-12345" />
          </Field>
        </div>
      )}

      {/* STEP 5: REVIEW */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="card-surface p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sender</h3>
            <p className="mt-2 text-sm font-medium">{draft.senderName}</p>
            <p className="text-sm text-muted-foreground">
              {draft.senderAddressLine1}, {draft.senderCity ?? ""}, {draft.senderCountry ?? ""}
            </p>
          </div>
          <div className="card-surface p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recipient</h3>
            <p className="mt-2 text-sm font-medium">{draft.recipientName}</p>
            <p className="text-sm text-muted-foreground">
              {draft.recipientAddressLine1}, {draft.recipientCity ?? ""}, {draft.recipientCountry ?? ""}
            </p>
          </div>
          <div className="card-surface p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Package</h3>
            <p className="mt-2 text-sm">
              {totalWeight.toFixed(3)} kg · {draft.lengthCm ?? 0}×{draft.widthCm ?? 0}×{draft.heightCm ?? 0} cm
            </p>
            <p className="text-sm text-muted-foreground">
              Declared value: {String(draft.currency ?? "USD")} {draft.declaredValue ?? 0}
            </p>
          </div>
          <div className="card-surface p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Service</h3>
            <p className="mt-2 text-sm">{selectedCarrier?.name} — {(selectedCarrier?.services.find((s) => s.id === String(draft.serviceId)))?.name}</p>
            {draft.reference && <p className="text-xs text-muted-foreground">Reference: {draft.reference}</p>}
            {!draft.carrierId && (
              <p className="mt-2 text-xs text-muted-foreground">
                No carrier selected — shipment will be created without a tracking number.
              </p>
            )}
          </div>
        </div>
      )}

      {/* nav buttons */}
      <div className="mt-8 flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={step === 0}>
          Back
        </Button>
        {step < 4 ? (
          <Button type="button" onClick={() => setStep((v) => v + 1)} disabled={!canProceed(step)}>
            Next
          </Button>
        ) : (
          <Button type="submit" size="lg" isLoading={isSubmitting} disabled={!canProceed(4)}>
            Create shipment
          </Button>
        )}
      </div>
    </form>
  );
}