import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata = { title: "Warehouse" };

export default async function WarehousePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasPermission(user, "warehouse_manage")) return null;

  return (
    <ComingSoon
      title="Warehouse"
      description="Origin facility management — receiving records, locations, bins and stock visibility for shipments stored in China."
    />
  );
}