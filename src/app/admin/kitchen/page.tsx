import { KitchenBoard } from "@/components/admin/kitchen-board";
import { getKitchenOrders } from "@/lib/kitchen-orders";

export const dynamic = "force-dynamic";

export default async function AdminKitchenPage() {
  const ordersList = await getKitchenOrders();

  return (
    <div className="relative overflow-hidden bg-stone-950 min-h-screen">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-no-repeat bg-center bg-[length:auto_70%] opacity-[0.06]" />
      <div className="relative p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Kitchen</h1>
        <KitchenBoard initialOrders={ordersList} />
      </div>
    </div>
  );
}
