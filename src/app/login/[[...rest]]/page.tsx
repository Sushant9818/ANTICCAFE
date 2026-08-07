"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const submitting = fetchStatus === "fetching";

  const [step, setStep] = useState<"credentials" | "trust-code">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function completeSignIn() {
    const { error: finalizeError } = await signIn.finalize();
    if (finalizeError) {
      setError(finalizeError.longMessage ?? "Could not complete sign-in.");
      return;
    }

    const redirectUrl = searchParams.get("redirect_url");
    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }
    const homeRes = await fetch("/api/auth/home");
    const { path } = await homeRes.json();
    router.push(path);
  }

  async function handleGoogleSignIn() {
    setError(null);
    const { error: ssoError } = await signIn.sso({
      strategy: "oauth_google",
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectCallbackUrl: `${window.location.origin}/sso-callback`,
    });
    if (ssoError) {
      setError(ssoError.longMessage ?? "Could not start Google sign-in.");
    }
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
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

    if (signIn.status === "needs_client_trust") {
      const { error: sendError } = await signIn.mfa.sendEmailCode();
      if (sendError) {
        setError(sendError.longMessage ?? "Could not send verification code.");
        return;
      }
      setStep("trust-code");
      return;
    }

    if (signIn.status !== "complete") {
      setError("Additional verification required.");
      return;
    }

    await completeSignIn();
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const { error: verifyError } = await signIn.mfa.verifyEmailCode({ code });
    if (verifyError) {
      setError(verifyError.longMessage ?? "Invalid code.");
      return;
    }

    if (signIn.status !== "complete") {
      setError("Additional verification required.");
      return;
    }

    await completeSignIn();
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

        <div className="relative h-full flex flex-col items-center justify-center text-center p-10">
          <div className="space-y-7 max-w-lg">
            <span className="text-4xl font-semibold tracking-widest text-amber-200/80 uppercase">
              AnticCafe
            </span>
            <p className="text-amber-200/70 text-xl">Nice to see you again</p>
            <h1 className="text-8xl font-bold text-white leading-none">
              Welcome back
            </h1>
            <div className="h-2 w-20 bg-amber-500 rounded-full mx-auto" />
            <p className="text-stone-400 text-xl leading-relaxed">
              Sign in to track your orders, manage reservations, and leave reviews.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        {step === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit} className="w-full max-w-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-amber-400">Sign In</h2>
              <p className="text-sm text-stone-400">
                Enter your email and password to continue.
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

            <div className="flex items-center gap-3 text-xs text-stone-500">
              <div className="h-px flex-1 bg-stone-800" />
              or
              <div className="h-px flex-1 bg-stone-800" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-stone-700 bg-stone-900 text-white text-sm font-semibold py-3 hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6v-3.1H1.28a12 12 0 0 0 0 10.8z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.6l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z"
                />
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-sm text-stone-400">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-amber-400 hover:text-amber-300 font-medium">
                Sign up
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="w-full max-w-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-amber-400">Verify it&apos;s you</h2>
              <p className="text-sm text-stone-400">
                New device detected — we sent a verification code to {email}.
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
              Verify & Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setError(null);
                setCode("");
              }}
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
