"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Icon from "@/components/Icon";

/**
 * Branded confirm dialog with a promise API, replacing window.confirm.
 *
 * Usage:
 *   const confirm = useConfirm();
 *   if (await confirm({ title, message, tone: "danger" })) { ...proceed... }
 *
 * One dialog is mounted at the app root; `confirm()` opens it and resolves
 * true/false when the user chooses. Escape or a backdrop click cancels.
 */
export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

const ConfirmContext = createContext<
  ((opts: ConfirmOptions) => Promise<boolean>) | null
>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within <ConfirmProvider>");
  }
  return ctx;
}

export default function ConfirmProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState<Pending | null>(null);
  const confirmBtn = useRef<HTMLButtonElement>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ ...opts, resolve })),
    [],
  );

  const close = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
    },
    [pending],
  );

  // Escape cancels; focus the confirm button when a dialog opens.
  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    document.addEventListener("keydown", onKey);
    confirmBtn.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, close]);

  const danger = pending?.tone === "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onClick={() => close(false)}
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={pending.title ?? "Please confirm"}
            onClick={(e) => e.stopPropagation()}
            className="dialog-pop w-full max-w-md overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    danger ? "bg-red-100 text-red-600" : "bg-brand/15 text-brand"
                  }`}
                >
                  <Icon name="alert" size={20} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-ink">
                    {pending.title ?? "Please confirm"}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
                    {pending.message}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => close(false)}
                  className="rounded-xl border border-ink/15 px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-ink/5"
                >
                  {pending.cancelLabel ?? "Cancel"}
                </button>
                <button
                  ref={confirmBtn}
                  onClick={() => close(true)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 ${
                    danger ? "bg-red-600" : "bg-brand"
                  }`}
                >
                  {pending.confirmLabel ?? "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
