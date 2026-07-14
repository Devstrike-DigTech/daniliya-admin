"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthSplit } from "@/components/auth/AuthSplit";
import PasswordField from "@/components/PasswordField";

const input =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";
const label = "mb-1.5 block text-sm font-bold";

export default function LoginForm() {
  const router = useRouter();

  return (
    <AuthSplit>
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-[34px] font-bold leading-tight">
          Welcome <span className="text-brand">Back!</span>
        </h1>
        <p className="mt-2 text-ink/55">Sign in to your admin account to continue</p>

        <form
          className="mt-8 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/");
          }}
        >
          <div>
            <label className={label}>Email Address</label>
            <input type="email" className={input} placeholder="Enter your email address" required />
          </div>
          <div>
            <label className={label}>Password</label>
            <PasswordField placeholder="Enter your Password" required />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--color-brand)]" /> Remember me for 30 days
            </label>
            <Link href="/forgot-password" className="text-sm font-bold text-green-700 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <button className="w-full rounded-xl bg-brand py-4 text-sm font-bold text-white transition-opacity hover:opacity-90">
            Sign In →
          </button>
        </form>
      </div>
    </AuthSplit>
  );
}
