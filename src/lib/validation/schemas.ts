import { z } from "zod";
import { isValidEmail, isValidPhone, isPositiveNumber } from "@/lib/utils";

/**
 * Shared validation schemas — used by the API, server actions and forms so
 * there is a single source of truth (spec §22).
 */

export const countrySchema = z
  .string()
  .min(2, "Country is required")
  .max(2, "Country must be an ISO code");

export const partitionSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  company: z.string().max(120).optional().nullable(),
  addressLine1: z.string().min(3, "Address is required").max(200),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().min(1, "City is required").max(120),
  state: z.string().max(120).optional().nullable(),
  province: z.string().max(120).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  countryCode: countrySchema,
  phone: z
    .string()
    .trim()
    .refine((v) => isValidPhone(v), { message: "Invalid phone number" })
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || isValidEmail(v), { message: "Invalid email" })
    .optional()
    .nullable(),
});

export const packageSchema = z.object({
  description: z.string().max(300).optional().nullable(),
  quantity: z.coerce.number().int().min(1).default(1),
  weightKg: z.coerce
    .number()
    .refine((v) => isPositiveNumber(v), { message: "Weight must be greater than 0" }),
  lengthCm: z.coerce.number().positive("Length must be positive"),
  widthCm: z.coerce.number().positive("Width must be positive"),
  heightCm: z.coerce.number().positive("Height must be positive"),
  declaredValue: z.coerce
    .number()
    .refine((v) => isPositiveNumber(v), { message: "Declared value must be greater than 0" }),
  currency: z.string().length(3).default("USD"),
});

export const serviceSchema = z.object({
  carrierId: z.string().min(1, "Carrier is required"),
  serviceId: z.string().min(1, "Service is required"),
  shippingMethod: z.string().max(40).optional().nullable(),
  isPriority: z.boolean().default(false),
});

export const createShipmentSchema = z.object({
  sender: partitionSchema,
  recipient: partitionSchema,
  package: packageSchema,
  service: serviceSchema.optional(),
  reference: z.string().max(120).optional().nullable(),
  customerOrderId: z.string().max(120).optional().nullable(),
  customerId: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Full name is required").max(120),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  company: z.string().max(120).optional(),
});

export const trackingQuerySchema = z.object({
  trackingNumber: z.string().trim().min(1, "Tracking number is required").max(64),
});

export const webhookEventSchema = z.object({
  event_id: z.string().optional(),
  tracking_number: z.string().min(1),
  status: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  country_code: z.string().optional(),
  timestamp: z.string().datetime({ offset: true }).optional(),
  external_shipment_id: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
});