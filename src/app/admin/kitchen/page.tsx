import { KitchenBoard } from "@/components/admin/kitchen-board";
import { getKitchenOrders } from "@/lib/kitchen-orders";

export const dynamic = "force-dynamic";

export default async function AdminKitchenPage() {
  const ordersList = await getKitchenOrders();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)] mb-6">
        Kitchen
      </h1>
      <KitchenBoard initialOrders={ordersList} />
    </div>
  );
}
