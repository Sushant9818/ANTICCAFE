"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <SignIn path="/login" routing="path" />
    </div>
  );
}
