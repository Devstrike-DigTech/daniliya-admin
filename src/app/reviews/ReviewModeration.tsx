"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/ConfirmDialog";
import { flagReview, keepReview, removeReview } from "./actions";

/**
 * Moderation controls for one review.
 *
 * Which controls appear depends on where the review actually is: a published
 * review can be flagged or taken down, a flagged one can be kept or removed,
 * and a removed one is done. Previously every row rendered Keep/Remove buttons
 * that did nothing.
 */
export default function ReviewModeration({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();

  const run = async (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, ask?: string) => {
    if (ask && !(await confirm({ message: ask }))) return;
    setError("");
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  };

  const btn = "rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-60";

  if (status === "REMOVED") {
    return <span className="text-xs text-ink/40">Taken down</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex justify-end gap-2">
        {status === "FLAGGED" && (
          <button
            disabled={pending}
            onClick={() => run(() => keepReview(id))}
            className={`${btn} bg-green-600 text-white hover:opacity-90`}
          >
            Keep
          </button>
        )}
        {status === "PUBLISHED" && (
          <button
            disabled={pending}
            onClick={() => {
              const reason = window.prompt("Why is this review being flagged? (optional)") ?? undefined;
              run(() => flagReview(id, reason || undefined));
            }}
            className={`${btn} border border-ink/15 text-ink/70 hover:bg-ink/5`}
          >
            Flag
          </button>
        )}
        <button
          disabled={pending}
          onClick={() =>
            run(
              () => removeReview(id),
              "Remove this review? It will no longer be visible on the product.",
            )
          }
          className={`${btn} border border-red-300 text-red-600 hover:bg-red-50`}
        >
          Remove
        </button>
      </div>
      {error && <p className="text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}
