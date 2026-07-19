"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

/**
 * A button that runs a Server Action and reports what actually happened.
 *
 * Admin writes move money and change people's account status, so the result is
 * never assumed: the button stays busy until the server replies, an error is
 * shown verbatim rather than swallowed, and `confirm` gates the destructive and
 * irreversible ones.
 */
export default function ActionButton({
  action,
  children,
  icon,
  confirm,
  variant = "primary",
  className = "",
  onDone,
}: {
  action: () => Promise<ActionResult>;
  children: React.ReactNode;
  icon?: string;
  /** Ask first. Use for anything that moves money or cannot be undone. */
  confirm?: string;
  variant?: "primary" | "success" | "danger" | "outline";
  className?: string;
  onDone?: (res: ActionResult) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const styles: Record<string, string> = {
    primary: "bg-brand text-white hover:opacity-90",
    success: "bg-green-600 text-white hover:opacity-90",
    danger: "border border-red-300 bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border border-ink/15 text-ink hover:bg-ink/5",
  };

  const run = () => {
    if (confirm && !window.confirm(confirm)) return;
    setError("");
    startTransition(async () => {
      const res = await action();
      if (!res.ok) setError(res.error);
      else router.refresh();
      onDone?.(res);
    });
  };

  return (
    <div className={className}>
      <button
        onClick={run}
        disabled={pending}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-opacity disabled:opacity-60 ${styles[variant]}`}
      >
        {icon && <Icon name={pending ? "clock" : icon} size={16} />}
        {pending ? "Working…" : children}
      </button>
      {error && (
        <p className="mt-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
