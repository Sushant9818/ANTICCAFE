"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

type Props = {
  initialName: string;
  initialPhone: string;
  email: string;
};

export function ProfileForm({ initialName, initialPhone, email }: Props) {
  const { user } = useUser();

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (!user) return;
    setChangingPassword(true);
    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: true,
      });
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message =
        err && typeof err === "object" && "errors" in err
          ? (err as { errors: { longMessage?: string; message?: string }[] }).errors[0]?.longMessage ??
            (err as { errors: { message?: string }[] }).errors[0]?.message
          : undefined;
      toast.error(message ?? "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 space-y-4">
        <h2 className="font-semibold text-white">Profile</h2>

        <div>
          <label className="block text-sm text-stone-400 mb-1.5">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white placeholder:text-stone-500 outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm text-stone-400 mb-1.5">Email</label>
          <input
            value={email}
            disabled
            className="w-full rounded-lg border border-stone-800 bg-stone-950/50 px-3 py-2 text-sm text-stone-500"
          />
        </div>

        <div>
          <label className="block text-sm text-stone-400 mb-1.5">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            type="tel"
            className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white placeholder:text-stone-500 outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={saveProfile}
          disabled={savingProfile}
          className="px-4 py-2 rounded-full bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 disabled:opacity-50"
        >
          {savingProfile ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 space-y-4">
        <h2 className="font-semibold text-white">Change Password</h2>

        <div>
          <label className="block text-sm text-stone-400 mb-1.5">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm text-stone-400 mb-1.5">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm text-stone-400 mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={changePassword}
          disabled={changingPassword || !currentPassword || !newPassword}
          className="px-4 py-2 rounded-full bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 disabled:opacity-50"
        >
          {changingPassword ? "Updating…" : "Change Password"}
        </button>
      </div>
    </div>
  );
}
