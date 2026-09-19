/**
 * Seed para o endereço do cliente:
 * Rua Clara Nunes, 6242/Casa, Aponiã
 * Porto Velho / RO
 * CEP: 76824-184
 * 
 * Rode com: npx tsx prisma/seed-client-address.ts
 */
import { PrismaClient, ShipmentStatus, EventSource } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding client shipment...");

  // Buscar org demo
  const org = await prisma.organization.findUnique({ where: { slug: "nexus-global" } });
  if (!org) {
    console.error("❌ Org 'nexus-global' não encontrada. Rode o seed principal primeiro.");
    process.exit(1);
  }

  // Buscar admin
  const admin = await prisma.user.findUnique({ where: { organizationId_email: { organizationId: org.id, email: "admin@demo.local" } } });
  if (!admin) {
    console.error("❌ Admin demo não encontrado.");
    process.exit(1);
  }

  // Buscar carrier demo
  const demoCarrier = await prisma.carrier.findUnique({ where: { organizationId_code: { organizationId: org.id, code: "demo-cn" } } });
  if (!demoCarrier) {
    console.error("❌ Carrier demo não encontrado.");
    process.exit(1);
  }

  // Buscar service demo
  const expressService = await prisma.carrierService.findUnique({ where: { carrierId_code: { carrierId: demoCarrier.id, code: "demo-express" } } });
  if (!expressService) {
    console.error("❌ Service demo não encontrado.");
    process.exit(1);
  }

  // Gerar códigos
  const year = new Date().getFullYear();
  const counter = Math.floor(Math.random() * 900000) + 100000;
  const shipmentNumber = `SHP-${year}-${String(counter).padStart(6, "0")}`;
  const trackingNumber = `DEMO-CN-${String(counter + 100000).padStart(6, "0")}`;

  console.log(`📦 Shipment: ${shipmentNumber}`);
  console.log(`🔖 Tracking: ${trackingNumber}`);

  // Endereço remetente (Shanghai)
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

  // Endereço destinatário (Porto Velho)
  const recipient = await prisma.address.create({
    data: {
      name: "Cliente Porto Velho",
      company: "Entrega Direta",
      addressLine1: "Rua Clara Nunes, 6242/Casa, Aponiã",
      city: "Porto Velho",
      state: "RO",
      postalCode: "76824-184",
      countryCode: "BR",
      phone: "+55 69 99999-0000",
      email: "cliente@portovelho.example",
    },
  });

  // Pacote
  const pkg = await prisma.package.create({
    data: {
      description: "Encomenda cliente Porto Velho",
      quantity: 1,
      weightKg: 1.5,
      lengthCm: 30,
      widthCm: 20,
      heightCm: 15,
      declaredValue: 150.0,
      currency: "BRL",
    },
  });

  // Shipment com status CREATED (postado ativo)
  const shipment = await prisma.shipment.create({
    data: {
      organizationId: org.id,
      shipmentNumber,
      trackingNumber,
      status: ShipmentStatus.CREATED,
      createdById: admin.id,
      senderAddressId: sender.id,
      recipientAddressId: recipient.id,
      packageId: pkg.id,
      carrierId: demoCarrier.id,
      serviceId: expressService.id,
      reference: "CLI-PVH-" + Date.now(),
      isDemo: true,
    },
  });

  // Timeline event inicial
  await prisma.trackingEvent.create({
    data: {
      shipmentId: shipment.id,
      status: ShipmentStatus.CREATED,
      description: "Encomenda postada - aguardando coleta",
      occurredAt: new Date(),
      receivedAt: new Date(),
      source: EventSource.SYSTEM,
      externalEventId: `CLI-EVT-${trackingNumber}-CREATED-0`,
    },
  });

  // Notification
  await prisma.notification.create({
    data: {
      organizationId: org.id,
      shipmentId: shipment.id,
      type: "SHIPMENT_CREATED",
      title: `Nova encomenda ${shipmentNumber}`,
      body: `Endereço: Rua Clara Nunes, 6242/Casa, Aponiã - Porto Velho/RO`,
    },
  });

  console.log("✅ Shipment criado com status CREATED (postado ativo)");
  console.log(`   Shipment ID: ${shipment.id}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });