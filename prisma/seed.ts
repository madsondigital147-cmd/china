/**
 * Database seed — DEVELOPMENT/DEMO ONLY.
 * Creates the default organization, roles, permissions, demo admin user,
 * demo carrier (sandbox), demo customers and demo shipments clearly marked.
 */
import { PrismaClient, RoleCode, ShipmentStatus, EventSource, CarrierStatus, EnvType, NotificationType, ApiKeyStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database (DEMO data)...");

  // ── Organization (multi-tenant default) ──
  const org = await prisma.organization.upsert({
    where: { slug: "nexus-global" },
    update: {},
    create: {
      name: "Nexus Global Logistics",
      slug: "nexus-global",
      countryCode: "CN",
      defaultLanguage: "en",
      defaultCurrency: "USD",
      timezone: "Asia/Shanghai",
    },
  });

  // ── Roles & permissions ──
  const permissionKeys = [
    "shipments.read", "shipments.create", "shipments.update", "shipments.cancel",
    "shipments.label", "shipments.receive", "customers.read", "customers.create",
    "customers.update", "carriers.read", "carriers.manage", "carriers.connect",
    "settings.read", "settings.manage", "users.manage", "audit.read",
    "reports.read", "notifications.read", "api.manage", "exceptions.manage",
    "support.manage", "warehouse.manage", "organizations.manage",
  ];

  const permissionIdCache = new Map<string, string>();
  for (const key of permissionKeys) {
    const role = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, name: key },
    });
    permissionIdCache.set(key, role.id);
  }

  const roleDefs = [
    { code: RoleCode.SUPER_ADMIN, name: "Super Admin", perms: permissionKeys },
    {
      code: RoleCode.ADMIN,
      name: "Administrator",
      perms: permissionKeys.filter((k) => k !== "organizations.manage"),
    },
    {
      code: RoleCode.OPERATOR,
      name: "Operator",
      perms: permissionKeys.filter((k) =>
        ["shipments", "customers", "carriers.read", "notifications", "exceptions", "warehouse", "reports.read"].some(
          (p) => k.startsWith(p),
        ),
      ),
    },
    {
      code: RoleCode.CUSTOMER,
      name: "Customer",
      perms: ["shipments.read", "shipments.create", "customers.read", "customers.update", "notifications.read"],
    },
  ];

  for (const def of roleDefs) {
    await prisma.role.upsert({
      where: { code: def.code },
      update: {},
      create: { code: def.code, name: def.name, description: `${def.name} role` },
    });
    await prisma.role.update({
      where: { code: def.code },
      data: {
        permissions: {
          connect: def.perms.map((k) => ({ id: permissionIdCache.get(k)! })),
        },
      },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { code: RoleCode.SUPER_ADMIN } });

  // ── Demo admin user ──
  const passwordHash = await bcrypt.hash(process.env.SEED_DEMO_ADMIN_PASSWORD ?? "DemoAdmin!2026", 12);
  const admin = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: org.id, email: "admin@demo.local" } },
    update: {},
    create: {
      organizationId: org.id,
      roleId: adminRole!.id,
      email: "admin@demo.local",
      name: "Demo Admin",
      passwordHash,
      timezone: "Asia/Shanghai",
      emailVerifiedAt: new Date(),
    },
  });

  // ── Demo API Key for /api/v1 ──
  const { createHash, randomBytes } = await import("crypto");
  const rawKey = `nk_live_${randomBytes(24).toString("base64url")}`;
  const keyPrefix = rawKey.slice(0, 12);
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  await prisma.apiKey.upsert({
    where: { keyHash },
    update: { keyPrefix, status: ApiKeyStatus.ACTIVE },
    create: {
      organizationId: org.id,
      keyPrefix,
      keyHash,
      name: "Demo API Key",
      status: ApiKeyStatus.ACTIVE,
    },
  });
  console.log(`🔑 Demo API Key: ${rawKey}`);
  console.log(`   Use: Authorization: Bearer ${rawKey}`);

  // ── Demo customers ──
  const customers = [
    {
      name: "Mercado Internacional Ltda",
      email: "customers@mercadointl.example",
      countryCode: "BR",
      company: "Mercado Internacional",
      phone: "+55 11 99999-0001",
    },
    {
      name: "Blue Ridge Trading",
      email: "customers@blueridgetrading.example",
      countryCode: "US",
      company: "Blue Ridge Trading Inc",
      phone: "+1 415 555 0100",
    },
    {
      name: "Ghibli Home Studio",
      email: "customers@ghiblihome.example",
      countryCode: "JP",
      company: "Ghibli Home K.K.",
      phone: "+81 3 5555 0100",
    },
  ];

  const customerRecords = [];
  for (const c of customers) {
    const record = await prisma.customer.upsert({
      where: { organizationId_email: { organizationId: org.id, email: c.email } },
      update: {},
      create: { organizationId: org.id, ...c },
    });
    customerRecords.push(record);
  }

  // ── Demo carrier (sandbox) ──
  const demoCarrier = await prisma.carrier.upsert({
    where: { organizationId_code: { organizationId: org.id, code: "demo-cn" } },
    update: {},
    create: {
      organizationId: org.id,
      code: "demo-cn",
      name: "Demo Carrier (Sandbox)",
      adapterKey: "demo-cn",
      countryCode: "CN",
      environment: EnvType.DEVELOPMENT,
      status: CarrierStatus.CONNECTED,
      isDemo: true,
      webhookSecret: "demo-webhook-secret",
    },
  });

  const expressService = await prisma.carrierService.upsert({
    where: { carrierId_code: { carrierId: demoCarrier.id, code: "demo-express" } },
    update: {},
    create: {
      carrierId: demoCarrier.id,
      code: "demo-express",
      name: "Demo Express",
      description: "Sandbox express service — no real shipments.",
      method: "air",
      priority: true,
      estDeliveryMinDays: 7,
      estDeliveryMaxDays: 15,
    },
  });

  // Status mappings for normalization demo (spec §16)
  const mappingData = [
    { externalStatus: "PACKAGE_RECEIVED", internalStatus: ShipmentStatus.RECEIVED },
    { externalStatus: "ARRIVED_AT_SORTING_CENTER", internalStatus: ShipmentStatus.PROCESSING },
    { externalStatus: "DELIVERY_ATTEMPT", internalStatus: ShipmentStatus.EXCEPTION },
  ];
  for (const m of mappingData) {
    await prisma.carrierStatusMapping.upsert({
      where: { carrierId_externalStatus: { carrierId: demoCarrier.id, externalStatus: m.externalStatus } },
      update: { internalStatus: m.internalStatus },
      create: { carrierId: demoCarrier.id, ...m },
    });
  }

  // ── Demo shipments (clearly DEMO) ──
  const demoShipments = [
    {
      reference: "DFY-ZYX-OVD-AKW",
      status: ShipmentStatus.CREATED,
      recipient: { name: "João da Silva", company: "Mercado Internacional", city: "São Paulo", countryCode: "BR" },
      eventDaysAgo: 0,
    },
    {
      reference: "DFY-UEK-OLM-BCP",
      status: ShipmentStatus.IN_TRANSIT,
      recipient: { name: "Emily Carter", company: "Blue Ridge Trading", city: "New York", countryCode: "US" },
      eventDaysAgo: 3,
    },
    {
      reference: "DFY-RPL-XWK-QZT",
      status: ShipmentStatus.DELIVERED,
      recipient: { name: "Haruto Tanaka", company: "Ghibli Home", city: "Tokyo", countryCode: "JP" },
      eventDaysAgo: 12,
    },
  ];

  for (let i = 0; i < demoShipments.length; i++) {
    const d = demoShipments[i];
    const num = `30${i}`;
    const shipmentNumber = `SHP-${new Date().getFullYear()}-${String(30001 + i)}`;
    const trackingNumber = (() => {
      const suffix = i;
      return `DEMO-CN-${"100000" + i}`;
    })();

    // Addresses
    const sender = await prisma.address.create({
      data: {
        name: "Nexus Operations",
        company: "Nexus Global Logistics",
        addressLine1: "88 Century Avenue, Pudong",
        city: "Shanghai",
        province: "Shanghai",
        postalCode: "200120",
        countryCode: "CN",
        phone: "+86 21 0000 0000",
        email: "ops@nexuslogistics.example",
      },
    });
    const recipient = await prisma.address.create({
      data: {
        name: d.recipient.name,
        company: d.recipient.company,
        addressLine1: "123 Central Avenue",
        city: d.recipient.city,
        state: d.recipient.countryCode === "BR" ? "SP" : null,
        postalCode: d.recipient.countryCode === "BR" ? "01310-100" : d.recipient.countryCode === "US" ? "10001" : "150-0001",
        countryCode: d.recipient.countryCode,
        phone: d.recipient.countryCode === "BR" ? "+55 11 99999-0001" : null,
        email: `${i}@customer.example`,
      },
    });
    const pkg = await prisma.package.create({
      data: {
        description: "Demo package — electronics accessories",
        quantity: 1,
        weightKg: 1.25,
        lengthCm: 25,
        widthCm: 18,
        heightCm: 10,
        declaredValue: 86.5,
        currency: "USD",
      },
    });

    const shipmentRow = await prisma.shipment.create({
      data: {
        organizationId: org.id,
        shipmentNumber,
        trackingNumber,
        status: d.status,
        createdById: admin.id,
        customerId: customerRecords[i].id,
        senderAddressId: sender.id,
        recipientAddressId: recipient.id,
        packageId: pkg.id,
        carrierId: demoCarrier.id,
        serviceId: expressService.id,
        reference: d.reference,
        isDemo: true,
      },
    });

    // Timeline events
    const eventStages: Array<{ status: ShipmentStatus; daysAgo: number; desc: string; src: EventSource }> = [
      { status: ShipmentStatus.CREATED, daysAgo: d.eventDaysAgo + 10, desc: "Shipment created", src: EventSource.SYSTEM },
      { status: ShipmentStatus.RECEIVED, daysAgo: d.eventDaysAgo + 8, desc: "Package received at origin facility", src: EventSource.CARRIER_WEBHOOK },
      { status: ShipmentStatus.PROCESSING, daysAgo: d.eventDaysAgo + 6, desc: "Package is being processed", src: EventSource.CARRIER_WEBHOOK },
    ];
    if (d.status === ShipmentStatus.IN_TRANSIT) {
      eventStages.push({ status: ShipmentStatus.DISPATCHED, daysAgo: d.eventDaysAgo + 4, desc: "International dispatch from China", src: EventSource.CARRIER_WEBHOOK });
      eventStages.push({ status: ShipmentStatus.IN_TRANSIT, daysAgo: d.eventDaysAgo + 1, desc: "Shipment departed origin", src: EventSource.CARRIER_WEBHOOK });
    }
    if (d.status === ShipmentStatus.DELIVERED) {
      eventStages.push({ status: ShipmentStatus.DISPATCHED, daysAgo: d.eventDaysAgo + 4, desc: "International dispatch from China", src: EventSource.CARRIER_WEBHOOK });
      eventStages.push({ status: ShipmentStatus.IN_TRANSIT, daysAgo: d.eventDaysAgo + 2, desc: "Shipment departed origin", src: EventSource.CARRIER_WEBHOOK });
      eventStages.push({ status: ShipmentStatus.ARRIVED_DESTINATION, daysAgo: 5, desc: "Shipment arrived in destination country", src: EventSource.CARRIER_WEBHOOK });
      eventStages.push({ status: ShipmentStatus.CUSTOMS, daysAgo: 4, desc: "Shipment under customs processing", src: EventSource.CARRIER_WEBHOOK });
      eventStages.push({ status: ShipmentStatus.OUT_FOR_DELIVERY, daysAgo: 1, desc: "Shipment is out for delivery", src: EventSource.CARRIER_WEBHOOK });
      eventStages.push({ status: ShipmentStatus.DELIVERED, daysAgo: 0, desc: "Shipment successfully delivered", src: EventSource.CARRIER_WEBHOOK });
    }

    for (const stage of eventStages) {
      await prisma.trackingEvent.create({
        data: {
          shipmentId: shipmentRow.id,
          status: stage.status,
          description: stage.desc,
          occurredAt: new Date(Date.now() - stage.daysAgo * 24 * 60 * 60 * 1000),
          receivedAt: new Date(),
          source: stage.src,
          externalEventId: `DMO-EVT-${trackingNumber}-${stage.status}-${stage.daysAgo}`,
        },
      });
    }

    // Notification for the most recent update
    await prisma.notification.create({
      data: {
        organizationId: org.id,
        shipmentId: shipmentRow.id,
        type: NotificationType.IN_TRANSIT,
        title: `Shipment ${shipmentNumber} updated`,
        body: `Status: ${d.status}`,
      },
    });
  }

  // ── System settings (spec §66-67, §144) ──
  const settings: Record<string, unknown> = {
    companyName: "Nexus Global Logistics",
    slogan: "Global logistics. From China to the world.",
    supportEmail: "support@nexuslogistics.example",
    defaultLanguage: "en",
    defaultCurrency: "USD",
    timezone: "Asia/Shanghai",
    shipmentNumberFormat: "SHP-{YYYY}-{000000}",
    statistics: {
      globalDestinations: 0,
      internationalShipments: 0,
      logisticsPartners: 0,
      countriesServed: 0,
      isDemo: true,
    },
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.systemSetting.upsert({
      where: { organizationId_key: { organizationId: org.id, key } },
      update: { value: value as object },
      create: { organizationId: org.id, key, value: value as object },
    });
  }

  // ── Demo warehouse (spec §70) ──
  const warehouse = await prisma.warehouse.upsert({
    where: { organizationId_code: { organizationId: org.id, code: "CN-PVG-01" } },
    update: {},
    create: {
      organizationId: org.id,
      code: "CN-PVG-01",
      name: "Pudong Consolidation Hub",
      addressLine1: "88 Century Avenue",
      city: "Shanghai",
      countryCode: "CN",
    },
  });
  const loc = await prisma.warehouseLocation.upsert({
    where: { warehouseId_code: { warehouseId: warehouse.id, code: "A" } },
    update: {},
    create: { warehouseId: warehouse.id, code: "A", name: "Receiving Zone" },
  });
  await prisma.warehouseBin.upsert({
    where: { locationId_code: { locationId: loc.id, code: "A-01" } },
    update: {},
    create: { locationId: loc.id, code: "A-01" },
  });

  console.log(`✅ Seeded org="${org.slug}" admin=${admin.email} (${admin.id})`)
  console.log("ℹ️  Demo data is marked isDemo=true and must never be presented as real shipments.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });