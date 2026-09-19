import Link from "next/link";
import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { CreateShipmentForm } from "@/components/shipments/create-shipment-form";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "New shipment" };

export default async function NewShipmentPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasPermission(user, "shipment_create")) return null;

  const carriers = await prisma.carrier.findMany({
    where: { organizationId: user.organizationId, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      isDemo: true,
      services: {
        where: { enabled: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/shipments"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to shipments
        </Link>
        <h1 className="page-title">Create shipment</h1>
        <p className="page-subtitle">Enter package details to create a new international shipment.</p>
      </div>

      {carriers.length === 0 ? (
        <div className="card-surface p-6 text-sm text-muted-foreground">
          No active carrier configured yet. Connect a carrier to generate tracking numbers automatically.
        </div>
      ) : (
        <CreateShipmentForm carriers={carriers} />
      )}
    </div>
  );
}