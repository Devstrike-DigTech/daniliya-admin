"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import ActionButton from "@/components/ActionButton";
import {
  acceptBooking,
  cancelBooking,
  completeBooking,
  rejectBooking,
  startBooking,
} from "../actions";

/**
 * The booking lifecycle controls, driven by the server's transition table
 * (bookings.service.ts TRANSITIONS). Only the legal next moves are offered:
 *
 *   REQUESTED   → Accept (prices the job) · Reject
 *   CONFIRMED   → Start job · Cancel
 *   IN_PROGRESS → Mark as completed · Cancel
 *   COMPLETED / CANCELLED → nothing; both are terminal
 *
 * The previous UI offered "Mark as completed" on a CONFIRMED booking, which the
 * server would have refused — CONFIRMED can only go to IN_PROGRESS. The start
 * step is exposed here so the lifecycle is actually reachable from the UI.
 */
export default function BookingActions({ bookingRef, status }: { bookingRef: string; status: string }) {
  const [dialog, setDialog] = useState<null | "accept" | "reject" | "cancel">(null);

  const close = () => setDialog(null);

  const cancelButton = (
    <button
      onClick={() => setDialog("cancel")}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
    >
      <Icon name="close" size={16} /> Cancel Booking
    </button>
  );

  return (
    <>
      {status === "REQUESTED" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setDialog("accept")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <Icon name="check" size={16} /> Accept
          </button>
          <button
            onClick={() => setDialog("reject")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
          >
            <Icon name="close" size={16} /> Reject
          </button>
        </div>
      )}

      {status === "CONFIRMED" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ActionButton action={startBooking.bind(null, bookingRef)} icon="check" variant="primary">
            Start job
          </ActionButton>
          {cancelButton}
        </div>
      )}

      {status === "IN_PROGRESS" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ActionButton
            action={completeBooking.bind(null, bookingRef)}
            icon="check"
            variant="success"
            confirm="Mark this booking as completed? Completed is a final state."
          >
            Mark as completed
          </ActionButton>
          {cancelButton}
        </div>
      )}

      {(status === "COMPLETED" || status === "CANCELLED") && (
        <p className="mt-6 rounded-2xl border border-ink/10 bg-ink/[0.03] px-5 py-4 text-sm text-ink/55">
          This booking is {status.toLowerCase()} — a final state, with no further action available.
        </p>
      )}

      {dialog === "accept" && <AcceptDialog bookingRef={bookingRef} onClose={close} />}
      {dialog === "reject" && (
        <ReasonDialog
          title="Reject request"
          cta="Reject request"
          hint="The customer's request is declined and the booking is cancelled."
          onClose={close}
          submit={(reason) => rejectBooking(bookingRef, reason)}
        />
      )}
      {dialog === "cancel" && (
        <ReasonDialog
          title="Cancel booking"
          cta="Cancel booking"
          hint="Cancelling is final — a cancelled booking cannot be reopened."
          onClose={close}
          submit={(reason) => cancelBooking(bookingRef, reason)}
        />
      )}
    </>
  );
}

const label = "mb-1.5 block text-sm font-bold";
const input =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";

function Shell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">{title}</p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <Icon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Accepting is where the job gets priced — quotedAmount is written here and
 * nowhere else in the admin, so the amount is the primary field.
 */
function AcceptDialog({ bookingRef, onClose }: { bookingRef: string; onClose: () => void }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await acceptBooking(bookingRef, {
        quotedAmount: amount.trim() === "" ? undefined : Number(amount),
        note,
      });
      if (!res.ok) setError(res.error);
      else {
        router.refresh();
        onClose();
      }
    });
  };

  return (
    <Shell title="Accept booking" onClose={onClose}>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className={label}>Quoted amount (₦)</label>
          <input
            className={input}
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="45000"
          />
          <p className="mt-1.5 text-xs text-ink/45">
            This is the price quoted to the customer for the job.
          </p>
        </div>
        <div>
          <label className={label}>Note (optional)</label>
          <textarea
            className={`${input} min-h-20 resize-y`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything the team should know"
          />
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
            className="rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Working…" : "Accept booking"}
          </button>
        </div>
      </form>
    </Shell>
  );
}

function ReasonDialog({
  title,
  cta,
  hint,
  onClose,
  submit: run,
}: {
  title: string;
  cta: string;
  hint: string;
  onClose: () => void;
  submit: (reason: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await run(reason);
      if (!res.ok) setError(res.error);
      else {
        router.refresh();
        onClose();
      }
    });
  };

  return (
    <Shell title={title} onClose={onClose}>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className={label}>Reason</label>
          <textarea
            className={`${input} min-h-24 resize-y`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this booking not going ahead?"
            required
          />
          <p className="mt-1.5 text-xs text-ink/45">{hint}</p>
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
            Back
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl border border-red-300 bg-red-50 py-3 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
          >
            {pending ? "Working…" : cta}
          </button>
        </div>
      </form>
    </Shell>
  );
}
