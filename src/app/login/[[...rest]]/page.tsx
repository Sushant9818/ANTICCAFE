"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const submitting = fetchStatus === "fetching";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const { error: signInError } = await signIn.password({
      identifier: email,
      password,
    });

    if (signInError) {
      setError(signInError.longMessage ?? "Invalid email or password.");
      return;
    }

    if (signIn.status !== "complete") {
      setError("Additional verification required.");
      return;
    }

    const { error: finalizeError } = await signIn.finalize();
    if (finalizeError) {
      setError(finalizeError.longMessage ?? "Could not complete sign-in.");
      return;
    }

    router.push("/admin/kitchen");
  }

  return (
    <div className="min-h-screen flex bg-stone-950">
      <div className="hidden md:block md:w-1/2 relative overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950">
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.08]"
          viewBox="0 0 400 800"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="800" fill="url(#grid)" />
        </svg>
        <div className="absolute -top-10 right-10 h-40 w-40 rounded-full border border-amber-500/20" />
        <div className="absolute top-24 right-24 h-3 w-3 rounded-full bg-amber-500/40" />
        <div className="absolute bottom-0 left-0 right-0 h-64">
          <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,80 C100,140 300,20 400,80 L400,200 L0,200 Z"
              fill="rgba(180,83,9,0.15)"
            />
            <path
              d="M0,120 C120,180 280,60 400,120 L400,200 L0,200 Z"
              fill="rgba(180,83,9,0.25)"
            />
          </svg>
        </div>

        <div className="relative h-full flex flex-col p-10">
          <span className="text-sm font-semibold tracking-widest text-amber-200/80 uppercase">
            AnticCafe
          </span>

          <div className="mt-auto space-y-4 max-w-sm">
            <p className="text-amber-200/70 text-sm">Nice to see you again</p>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Welcome back
            </h1>
            <div className="h-1 w-12 bg-amber-500 rounded-full" />
            <p className="text-stone-400 text-sm leading-relaxed">
              Sign in to manage orders, the kitchen board, and the menu.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-amber-400">Admin Login</h2>
            <p className="text-sm text-stone-400">
              Enter your credentials to access the admin dashboard.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email ID"
              autoComplete="username"
              className="w-full rounded-lg border-l-4 border-l-amber-600 border border-stone-800 bg-stone-900 px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-l-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-colors"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full rounded-lg border-l-4 border-l-amber-600 border border-stone-800 bg-stone-900 px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-l-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-colors"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
              className="h-4 w-4 rounded border-stone-700 bg-stone-900 accent-amber-600"
            />
            Keep me signed in
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-700 text-white text-sm font-semibold py-3 hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
