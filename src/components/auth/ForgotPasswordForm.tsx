"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";
import { AuthSplit } from "@/components/auth/AuthSplit";

const input =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";
const label = "mb-1.5 block text-sm font-bold";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <AuthSplit>
      <p className="text-2xl font-bold text-brand">Daniliya</p>

      {!sent ? (
        <>
          <h1 className="mt-5 text-[34px] font-bold leading-tight">
            Forgot your <span className="text-brand">password</span>?
          </h1>
          <p className="mt-2 text-sm text-ink/55">
            Enter the email linked to your account and we&apos;ll send you a link
            to reset it.
          </p>
          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div>
              <label className={label}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={input}
                placeholder="e.g yourmail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
              Send reset link
            </button>
          </form>
          <p className="mt-6 text-sm text-ink/60">
            Remembered it?{" "}
            <Link href="/login" className="font-bold text-brand hover:underline">
              Back to login
            </Link>
          </p>
        </>
      ) : (
        <>
          <span className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <Icon name="mail" size={26} />
          </span>
          <h1 className="mt-5 text-[34px] font-bold leading-tight">
            Check your <span className="text-brand">email</span>
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            We sent a password reset link to{" "}
            <span className="font-bold text-ink">{email || "your email"}</span>.
            The link expires in 30 minutes.
          </p>

          {/* Demo shortcut: a real build delivers this link by email */}
          <Link
            href="/reset-password"
            className="mt-7 block w-full rounded-xl bg-brand py-3.5 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Open the reset link
          </Link>
          <button
            onClick={() => setSent(false)}
            className="mt-3 w-full rounded-xl border border-ink/15 py-3.5 text-sm font-bold transition-colors hover:bg-ink/5"
          >
            Use a different email
          </button>

          <p className="mt-6 text-sm text-ink/60">
            <Link href="/login" className="font-bold text-brand hover:underline">
              Back to login
            </Link>
          </p>
        </>
      )}
    </AuthSplit>
  );
}
