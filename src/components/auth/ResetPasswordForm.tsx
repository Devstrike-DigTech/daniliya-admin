"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { AuthSplit } from "@/components/auth/AuthSplit";
import PasswordField from "@/components/PasswordField";

const label = "mb-1.5 block text-sm font-bold";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  const tooShort = pwd.length > 0 && pwd.length < 8;
  const mismatch = confirm.length > 0 && confirm !== pwd;
  const valid = pwd.length >= 8 && confirm === pwd;

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

      <form
        className="mt-7 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) setDone(true);
        }}
      >
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
        <button
          disabled={!valid}
          className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset password
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
