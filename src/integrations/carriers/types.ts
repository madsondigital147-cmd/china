/**
 * Carrier Adapter Layer — spec §25, §132, §192-193.
 *
 * The platform never fakes real carrier tracking. Each carrier integration is
 * an adapter implementing this interface. The DemoCarrierAdapter is clearly
 * marked DEMO: it only produces synthetic sandbox data for development.
 *
 * Real carriers (e.g. YunExpress, 4PX, Yanwen, China Post ePacket, etc.) get
 * their own adapter under src/integrations/carriers/<code>/ once configured.
 */

export interface CarrierCredentials {
  apiBaseUrl?: string | null;
  apiKey?: string | null;
  apiSecret?: string | null;
  accountId?: string | null;
  username?: string | null;
  password?: string | null;
}

export interface CarrierShipmentPayload {
  shipmentNumber: string;
  trackingNumber?: string | null;
  sender: {
    name: string;
    company?: string | null;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state?: string | null;
    postalCode?: string | null;
    countryCode: string;
    phone?: string | null;
    email?: string | null;
  };
  recipient: {
    name: string;
    company?: string | null;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state?: string | null;
    postalCode?: string | null;
    countryCode: string;
    phone?: string | null;
    email?: string | null;
  };
  package: {
    description?: string | null;
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    declaredValue: number;
    currency: string;
  };
  serviceCode?: string | null;
  reference?: string | null;
}

export interface CarrierCreateShipmentResult {
  trackingNumber: string;
  externalShipmentId?: string | null;
  labelUrl?: string | null;
}

export interface CarrierRateInput {
  originCountry: string;
  destCountry: string;
  weightKg: number;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
}

export interface CarrierRateResult {
  carrierCode: string;
  serviceCode: string;
  price: number;
  currency: string;
  estDeliveryMinDays: number;
  estDeliveryMaxDays: number;
  isDemo: boolean;
}

export interface CarrierTrackingEvent {
  providerStatus: string;
  status?: string; // optional normalized status hint from carrier
  description?: string | null;
  location?: string | null;
  city?: string | null;
  countryCode?: string | null;
  timestamp?: string | null;
  externalEventId?: string | null;
}

export interface CarrierTrackingResult {
  trackingNumber: string;
  events: CarrierTrackingEvent[];
  lastUpdate?: string | null;
}

export interface CarrierAdapter {
  readonly key: string;
  readonly displayName: string;
  readonly isDemo: boolean;
  createShipment(shipment: CarrierShipmentPayload, credentials: CarrierCredentials): Promise<CarrierCreateShipmentResult>;
  getRates(input: CarrierRateInput, credentials: CarrierCredentials): Promise<CarrierRateResult[]>;
  getTracking(trackingNumber: string, credentials: CarrierCredentials): Promise<CarrierTrackingResult | null>;
  getShipment(trackingNumber: string, credentials: CarrierCredentials): Promise<CarrierCreateShipmentResult | null>;
  cancelShipment(trackingNumber: string, credentials: CarrierCredentials): Promise<boolean>;
  createLabel(trackingNumber: string, credentials: CarrierCredentials): Promise<string | null>;
  validateAddress?(address: CarrierShipmentPayload["recipient"]): Promise<{ valid: boolean; message?: string }>;
  testConnection(credentials: CarrierCredentials): Promise<{ connected: boolean; message?: string }>;
}

export interface WebhookVerifier {
  verify(payloadBody: string, signatureHeader: string | null, secret: string | null): boolean;
}