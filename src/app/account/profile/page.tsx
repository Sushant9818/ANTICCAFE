import { getCurrentCustomer } from "@/lib/customer";
import { AccountNav } from "@/components/account/account-nav";
import { ProfileForm } from "@/components/account/profile-form";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const customer = await getCurrentCustomer();

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
      <p className="text-stone-400 mb-6">Update your details and password.</p>
      <AccountNav />
      <ProfileForm
        initialName={customer?.name ?? ""}
        initialPhone={customer?.phone ?? ""}
        email={customer?.email ?? ""}
      />
    </div>
  );
}
