"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const submitting = fetchStatus === "fetching";

  const [step, setStep] = useState<"details" | "code">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const [firstName, ...rest] = name.trim().split(" ");

    const { error: createError } = await signUp.password({
      emailAddress: email,
      password,
      firstName,
      lastName: rest.join(" ") || undefined,
    });

    if (createError) {
      setError(createError.longMessage ?? "Could not create your account.");
      return;
    }

    const { error: codeError } = await signUp.verifications.sendEmailCode();
    if (codeError) {
      setError(codeError.longMessage ?? "Could not send verification code.");
      return;
    }

    setStep("code");
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
    if (verifyError) {
      setError(verifyError.longMessage ?? "Invalid code.");
      return;
    }

    if (signUp.status !== "complete") {
      setError("Additional verification required.");
      return;
    }

    const { error: finalizeError } = await signUp.finalize();
    if (finalizeError) {
      setError(finalizeError.longMessage ?? "Could not complete sign-up.");
      return;
    }

    router.push(searchParams.get("redirect_url") || "/account/orders");
  }

  return (
    <div className="min-h-screen flex bg-stone-950">
      <div className="hidden md:block md:w-1/2 relative overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950">
        <div className="absolute inset-0 bg-[url('/images/antic-cafez-logo-transparent.png')] bg-no-repeat bg-center bg-[length:auto_60%] opacity-20" />
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
            <path d="M0,80 C100,140 300,20 400,80 L400,200 L0,200 Z" fill="rgba(180,83,9,0.15)" />
            <path d="M0,120 C120,180 280,60 400,120 L400,200 L0,200 Z" fill="rgba(180,83,9,0.25)" />
          </svg>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center p-10">
          <div className="space-y-7 max-w-lg">
            <span className="text-4xl font-semibold tracking-widest text-amber-200/80 uppercase">
              AnticCafe
            </span>
            <p className="text-amber-200/70 text-xl">Join us</p>
            <h1 className="text-8xl font-bold text-white leading-none">
              Create account
            </h1>
            <div className="h-2 w-20 bg-amber-500 rounded-full mx-auto" />
            <p className="text-stone-400 text-xl leading-relaxed">
              Track your orders, book a table, and leave reviews on your favorites.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        {step === "details" ? (
          <form onSubmit={handleDetailsSubmit} className="w-full max-w-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-amber-400">Create Account</h2>
              <p className="text-sm text-stone-400">Sign up to get started.</p>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                className="w-full rounded-lg border-l-4 border-l-amber-600 border border-stone-800 bg-stone-900 px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-l-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-colors"
              />
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="new-password"
                className="w-full rounded-lg border-l-4 border-l-amber-600 border border-stone-800 bg-stone-900 px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-l-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-700 text-white text-sm font-semibold py-3 hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue
            </button>

            <p className="text-center text-sm text-stone-400">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="w-full max-w-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-amber-400">Check your email</h2>
              <p className="text-sm text-stone-400">
                We sent a verification code to {email}.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Verification code"
              autoComplete="one-time-code"
              autoFocus
              className="w-full rounded-lg border-l-4 border-l-amber-600 border border-stone-800 bg-stone-900 px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-l-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-colors"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-700 text-white text-sm font-semibold py-3 hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify & Create Account
            </button>

            <button
              type="button"
              onClick={() => setStep("details")}
              className="w-full text-center text-sm text-stone-400 hover:text-stone-300"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
