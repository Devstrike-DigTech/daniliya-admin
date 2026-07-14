"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthSplit } from "@/components/auth/AuthSplit";

export default function VerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = d;
    setCode(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const filled = code.every((c) => c !== "");

  return (
    <AuthSplit>
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-ink/60">
          Enter the 6-digit code we sent to your work email to activate your admin account.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/");
          }}
          className="mt-8"
        >
          <div className="flex gap-2">
            {code.map((c, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                inputMode="numeric"
                maxLength={1}
                value={c}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
                }}
                className="h-14 w-full rounded-xl border border-ink/15 bg-white text-center text-lg font-bold outline-none transition-colors focus:border-brand"
              />
            ))}
          </div>

          <button
            disabled={!filled}
            className="mt-6 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40"
          >
            Verify &amp; continue
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/60">
          Didn&apos;t get a code?{" "}
          <button className="font-bold text-brand hover:underline">Resend</button> ·{" "}
          <Link href="/login" className="font-bold text-brand hover:underline">Back to sign in</Link>
        </p>
      </div>
    </AuthSplit>
  );
}
