import type {
  CarrierAdapter,
  CarrierCredentials,
  CarrierShipmentPayload,
  CarrierCreateShipmentResult,
  CarrierRateInput,
  CarrierRateResult,
  CarrierTrackingResult,
  WebhookVerifier,
} from "./types";
import { createHmac, timingSafeEqual } from "crypto";
import { randomBytes } from "crypto";

/**
 * DemoCarrierAdapter — SANDBOX ONLY.
 *
 * Clearly marked DEMO (spec §81, §192). Produces deterministic synthetic
 * tracking events so the full pipeline can be exercised without any real
 * carrier connection. It is never served as a real tracking provider.
 */
export class DemoCarrierAdapter implements CarrierAdapter {
  readonly key = "demo-cn";
  readonly displayName = "Demo Carrier (Sandbox)";
  readonly isDemo = true;

  private trackingPrefix = "DEMO-CN-";

  private nextSequence(shippingMethod: string): number {
    // deterministic per shipment method so sequences are stable within a run
    const seed = shippingMethod.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return 100000 + (seed % 900000);
  }

  async createShipment(shipment: CarrierShipmentPayload): Promise<CarrierCreateShipmentResult> {
    const seq = this.nextSequence(shipment.package.weightKg.toFixed(1));
    const trackingNumber = `${this.trackingPrefix}${seq}${randomBytes(2).toString("hex").toUpperCase()}`;
    return {
      trackingNumber,
      externalShipmentId: `DMO-${process.hrtime.bigint().toString(36)}`,
      labelUrl: null,
    };
  }

  async getRates(input: CarrierRateInput, credentials?: CarrierCredentials): Promise<CarrierRateResult[]> {
    const weight = Math.max(input.weightKg, 0.5);
    // synthetic base pricing, clearly demo
    const base = 28; // USD, demo price
    const perKg = 6.5;
    const currency = credentials?.apiKey ? "USD" : "USD";

    const regionMultiplier = destinationRegionMultiplier(input.destCountry);
    const price = Math.round((base + weight * perKg) * regionMultiplier * 100) / 100;

    return [
      {
        carrierCode: this.key,
        serviceCode: "demo-express",
        price,
        currency,
        estDeliveryMinDays: 7,
        estDeliveryMaxDays: 15,
        isDemo: true,
      },
      {
        carrierCode: this.key,
        serviceCode: "demo-eco",
        price: Math.round(price * 0.7 * 100) / 100,
        currency,
        estDeliveryMinDays: 15,
        estDeliveryMaxDays: 30,
        isDemo: true,
      },
    ];
  }

  async getTracking(trackingNumber: string): Promise<CarrierTrackingResult | null> {
    if (!trackingNumber.toUpperCase().startsWith(this.trackingPrefix)) return null;

    // Synthetic timeline based on the tracking suffix — deterministic and stable
    const suffix = trackingNumber.toUpperCase().slice(this.trackingPrefix.length) || "0";
    const progression = Number(parseInt(suffix, 36) % 11);
    const now = new Date();

    const stages: Array<[providerStatus: string, daysAgo: number, description: string]> = [
      ["SHIPMENT_CREATED", -4, "Shipment created"],
      ["PACKAGE_RECEIVED", -3, "Package received at origin facility"],
      ["ARRIVED_AT_SORTING_CENTER", -2.4, "Arrived at sorting center"],
      ["PROCESSING", -1.8, "Package is being processed"],
      ["DEPARTED_ORIGIN", -1.2, "International dispatch from China"],
      ["FLIGHT_ARRIVED", -0.8, "Arrived in destination country"],
      ["CUSTOMS_CLEARANCE", -0.5, "Under customs processing"],
      ["OUT_FOR_DELIVERY", -0.2, "Out for delivery"],
      ["DELIVERED", 0, "Delivered"],
    ];

    const events = stages
      .filter((_, i) => i <= progression)
      .map(([providerStatus, daysAgo, description], i) => {
        const ts = new Date(now.getTime() + daysAgo * 24 * 60 * 60 * 1000);
        return {
          providerStatus,
          description,
          location: i % 3 === 0 ? "Shanghai, CN" : i % 3 === 1 ? "International Hub" : "Destination Country",
          countryCode: i % 3 === 2 ? "XX" : "CN",
          timestamp: ts.toISOString(),
          externalEventId: `DMO-EVT-${trackingNumber}-${providerStatus}`,
        };
      });

    return {
      trackingNumber,
      events,
      lastUpdate: now.toISOString(),
    };
  }

  async getShipment(trackingNumber: string): Promise<CarrierCreateShipmentResult | null> {
    if (!trackingNumber.toUpperCase().startsWith(this.trackingPrefix)) return null;
    return { trackingNumber, externalShipmentId: `DMO-${trackingNumber}` };
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    return trackingNumber.toUpperCase().startsWith(this.trackingPrefix);
  }

  async createLabel(): Promise<string | null> {
    return null; // labels are generated locally by the platform
  }

  async testConnection(): Promise<{ connected: boolean; message?: string }> {
    return { connected: true, message: "Demo carrier is always available (sandbox)." };
  }
}

function destinationRegionMultiplier(countryCode: string): number {
  const map: Record<string, number> = {
    BR: 1.12,
    US: 1.0,
    CA: 1.05,
    MX: 1.1,
    FR: 1.15,
    DE: 1.12,
    IT: 1.15,
    ES: 1.15,
    GB: 1.1,
    JP: 1.2,
    AU: 1.25,
  };
  return map[countryCode.toUpperCase()] ?? 1.2;
}

export const demoCarrierAdapter = new DemoCarrierAdapter();

/**
 * Registry of adapters. New carriers are added here (spec §132).
 */
export const carrierAdapters: Record<string, CarrierAdapter> = {
  [demoCarrierAdapter.key]: demoCarrierAdapter,
};

export function getAdapter(adapterKey: string | null | undefined): CarrierAdapter | null {
  if (!adapterKey) return null;
  return carrierAdapters[adapterKey] ?? null;
}

export function adapterSupports(adapterKey: string): boolean {
  return adapterKey in carrierAdapters;
}

/**
 * HMAC-SHA256 webhook signature verifier (spec §48, §97).
 * Carriers may sign webhooks; the platform verifies with the stored secret.
 */
export const hmacWebhookVerifier: WebhookVerifier = {
  verify(payloadBody, signatureHeader, secret) {
    if (!secret) return false;
    if (!signatureHeader) return false;
    try {
      const expected = createHmac("sha256", secret).update(payloadBody).digest("hex");
      const provided = signatureHeader.replace(/^sha256=|^hmac=/i, "");
      const a = Buffer.from(expected, "utf8");
      const b = Buffer.from(provided, "utf8");
      if (a.length !== b.length) return false;
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  },
};