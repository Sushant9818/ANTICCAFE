"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SSOCallbackPage() {
  const clerk = useClerk();
  const router = useRouter();
  const ran = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        await clerk.handleRedirectCallback(
          { signInFallbackRedirectUrl: "/account/orders", signUpFallbackRedirectUrl: "/account/orders" },
          async () => {}
        );
      } catch {
        setError("Google sign-in failed. Please try again.");
        return;
      }

      const homeRes = await fetch("/api/auth/home");
      const { path } = await homeRes.json();
      router.replace(path);
    })();
  }, [clerk, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-950">
      {error ? (
        <>
          <p className="text-red-400 text-sm">{error}</p>
          <a href="/login" className="text-amber-400 text-sm hover:text-amber-300">
            Back to sign in
          </a>
        </>
      ) : (
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      )}
    </div>
  );
}
