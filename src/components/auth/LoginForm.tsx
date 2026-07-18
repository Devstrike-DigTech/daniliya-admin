"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthSplit } from "@/components/auth/AuthSplit";
import PasswordField from "@/components/PasswordField";

const input =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";
const label = "mb-1.5 block text-sm font-bold";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.message ?? "Sign in failed. Try again.");
        return;
      }
      router.replace(params.get("next") ?? "/");
      router.refresh();
    } catch {
      setError("Could not reach the server. Is the API running?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthSplit>
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-[34px] font-bold leading-tight">
          Welcome <span className="text-brand">Back!</span>
        </h1>
        <p className="mt-2 text-ink/55">Sign in to your admin account to continue</p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
            >
              {error}
            </p>
          )}
          <div>
            <label className={label}>Email Address</label>
            <input
              type="email"
              name="email"
              className={input}
              placeholder="Enter your email address"
              required
            />
          </div>
          <div>
            <label className={label}>Password</label>
            <PasswordField name="password" placeholder="Enter your Password" required />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--color-brand)]" /> Remember me for 30 days
            </label>
            <Link href="/forgot-password" className="text-sm font-bold text-green-700 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-brand py-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign In →"}
          </button>
        </form>
      </div>
    </AuthSplit>
  );
}
