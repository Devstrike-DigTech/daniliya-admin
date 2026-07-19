"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import ActionButton from "@/components/ActionButton";
import { approveProduct, rejectProduct } from "./actions";

/**
 * The two moderation controls the API actually supports: approve and reject.
 *
 * Deliberately no "unlist" or "remove" — the API has no endpoint for either.
 * REMOVED is a vendor-side state (vendor deletes a product that has order
 * history); rejecting is not a substitute for unlisting, because it writes a
 * `rejectedReason` the vendor sees.
 *
 * Approve is offered only where there is something to approve, and reject only
 * where the product is not already rejected or gone. The server does not guard
 * the source status, so this gating is the only thing preventing a nonsense
 * transition such as re-approving a REMOVED product.
 */

/** Statuses an admin can move to ACTIVE. */
const CAN_APPROVE = ["DRAFT", "PENDING_REVIEW", "REJECTED"];
/** Statuses an admin can reject. REMOVED is the vendor's, not ours to touch. */
const CAN_REJECT = ["DRAFT", "PENDING_REVIEW", "ACTIVE"];

export default function ProductModeration({
  id,
  status,
  rejectedReason,
  onDone,
}: {
  id: string;
  status: string;
  rejectedReason?: string | null;
  onDone?: () => void;
}) {
  const [rejecting, setRejecting] = useState(false);

  const canApprove = CAN_APPROVE.includes(status);
  const canReject = CAN_REJECT.includes(status);

  if (!canApprove && !canReject) {
    return (
      <p className="mt-6 rounded-2xl border border-ink/10 bg-ink/[0.03] px-5 py-4 text-sm text-ink/55">
        {status === "REMOVED"
          ? "This product was removed by its vendor. There is no admin action that can restore it."
          : "No moderation action is available for this product."}
      </p>
    );
  }

  return (
    <>
      {status === "REJECTED" && rejectedReason && (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
          Rejected: {rejectedReason}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {canApprove && (
          <ActionButton
            action={approveProduct.bind(null, id)}
            icon="check"
            variant="success"
            confirm="Approve this product? It goes live in the public catalogue immediately."
            onDone={(res) => res.ok && onDone?.()}
          >
            Approve
          </ActionButton>
        )}
        {canReject && (
          <button
            onClick={() => setRejecting(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
          >
            <Icon name="close" size={16} /> Reject
          </button>
        )}
      </div>

      {rejecting && (
        <RejectModal
          id={id}
          onClose={() => setRejecting(false)}
          onDone={() => {
            setRejecting(false);
            onDone?.();
          }}
        />
      )}
    </>
  );
}

const label = "mb-1.5 block text-sm font-bold";
const input =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";

function RejectModal({
  id,
  onClose,
  onDone,
}: {
  id: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await rejectProduct(id, reason);
      if (!res.ok) setError(res.error);
      else {
        router.refresh();
        onDone();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">Reject product</p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <Icon name="close" size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className={label}>Reason</label>
            <textarea
              className={`${input} min-h-24 resize-y`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tell the vendor what needs to change"
              required
            />
            <p className="mt-1.5 text-xs text-ink/45">The vendor sees this reason.</p>
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ink/15 py-3 text-sm font-bold hover:bg-ink/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl border border-red-300 bg-red-50 py-3 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
            >
              {pending ? "Working…" : "Reject product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
