import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/login?redirect_url=/account/orders");

  return <div className="bg-stone-950 min-h-screen">{children}</div>;
}
