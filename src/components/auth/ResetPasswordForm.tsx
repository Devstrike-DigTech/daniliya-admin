"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import { AuthSplit } from "@/components/auth/AuthSplit";
import PasswordField from "@/components/PasswordField";

const label = "mb-1.5 block text-sm font-bold";
const input =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";

export default function ResetPasswordForm() {
  const params = useSearchParams();
  // The reset email carries a code; a link may also pass it as ?token=.
  const tokenFromUrl = params.get("token") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const tooShort = pwd.length > 0 && pwd.length < 8;
  const mismatch = confirm.length > 0 && confirm !== pwd;
  const valid = pwd.length >= 8 && confirm === pwd && token.trim().length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), password: pwd }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Could not reset the password. The code may have expired.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <AuthSplit>
        <p className="text-2xl font-bold text-brand">Daniliya</p>
        <span className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/15 text-green-600">
          <Icon name="check" size={28} />
        </span>
        <h1 className="mt-5 text-[34px] font-bold leading-tight">
          Password <span className="text-brand">reset</span>
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Your password has been updated. You can now log in with your new
          password.
        </p>
        <Link
          href="/login"
          className="mt-7 block w-full rounded-xl bg-brand py-3.5 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Back to login
        </Link>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit>
      <p className="text-2xl font-bold text-brand">Daniliya</p>
      <h1 className="mt-5 text-[34px] font-bold leading-tight">
        Set a new <span className="text-brand">password</span>
      </h1>
      <p className="mt-2 text-sm text-ink/55">
        Choose a strong password you haven&apos;t used before.
      </p>

      <form className="mt-7 space-y-4" onSubmit={submit}>
        {!tokenFromUrl && (
          <div>
            <label className={label}>
              Reset code <span className="text-red-500">*</span>
            </label>
            <input
              className={input}
              placeholder="Paste the code from your email"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label className={label}>
            New Password <span className="text-red-500">*</span>
          </label>
          <PasswordField
            placeholder="Least 8 characters"
            value={pwd}
            onChange={setPwd}
            required
          />
          {tooShort && (
            <p className="mt-1.5 text-xs text-red-500">
              Password must be at least 8 characters.
            </p>
          )}
        </div>
        <div>
          <label className={label}>
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <PasswordField
            placeholder="Repeat password"
            value={confirm}
            onChange={setConfirm}
            required
          />
          {mismatch && (
            <p className="mt-1.5 text-xs text-red-500">
              Passwords don&apos;t match.
            </p>
          )}
        </div>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        <button
          disabled={!valid || busy}
          className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        <Link href="/login" className="font-bold text-brand hover:underline">
          Back to login
        </Link>
      </p>
    </AuthSplit>
  );
}
