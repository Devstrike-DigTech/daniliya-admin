"use client";

import { useState, useTransition } from "react";
import Icon from "@/components/Icon";
import ActionButton from "@/components/ActionButton";
import { rejectKyc } from "./actions";
import { approveKyc } from "./actions";

export type KycSubmission = {
  id: string;
  status: string;
  idType: string | null;
  /** Full number, decrypted for review; falls back to last-4 if unavailable. */
  idNumber: string | null;
  idNumberLast4: string | null;
  dob: string | null;
  govIdUrl: string | null;
  reason: string | null;
  submittedAt: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  bankAccount: { bankName: string | null; accountName: string | null } | null;
};

const ID_TYPE_LABEL: Record<string, string> = {
  NIN: "National ID (NIN)",
  BVN: "BVN",
  DRIVERS_LICENSE: "Driver's licence",
  PASSPORT: "Passport",
  VOTER_ID: "Voter's card",
};

const statusPill: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  PENDING_MANUAL: "bg-amber-100 text-amber-700",
  VERIFIED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
  PENDING: "bg-ink/8 text-ink/60",
};
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ");
const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const name = (u: KycSubmission["user"]) => `${u.firstName} ${u.lastName}`;

export default function KycReviewView({ queue }: { queue: KycSubmission[] }) {
  const [rejecting, setRejecting] = useState<KycSubmission | null>(null);

  const manual = queue.filter((k) => k.status === "PENDING_MANUAL").length;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">KYC review</h1>
          <p className="mt-1 text-sm text-ink/55">
            Identity checks awaiting a decision. Smile ID auto-verifies where it can;
            these need a human because the check was inconclusive or unconfigured.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="In the queue" value={`${queue.length}`} />
        <SummaryCard label="Awaiting manual review" value={`${manual}`} />
        <SummaryCard label="Auto-submitted" value={`${queue.length - manual}`} />
      </div>

      <div className="mt-6 space-y-4">
        {queue.map((k) => (
          <div key={k.id} className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-lg font-bold">
                  {name(k.user)}
                  <span className="rounded-full bg-ink/8 px-2.5 py-0.5 text-xs font-bold text-ink/60">
                    {label(k.user.role)}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusPill[k.status] ?? "bg-ink/8 text-ink/60"}`}>
                    {label(k.status)}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-ink/55">{k.user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  action={() => approveKyc(k.id)}
                  icon="check"
                  variant="success"
                  confirm={`Approve ${name(k.user)}'s identity? This unlocks payouts for them.`}
                >
                  Approve
                </ActionButton>
                <button
                  onClick={() => setRejecting(k)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                >
                  <Icon name="ban" size={16} /> Reject
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 border-t border-ink/8 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <Detail label="ID type" value={k.idType ? (ID_TYPE_LABEL[k.idType] ?? k.idType) : "—"} />
              <Detail label="ID number" value={k.idNumber ?? (k.idNumberLast4 ? `••••${k.idNumberLast4}` : "—")} mono />
              <Detail label="Date of birth" value={k.dob ?? "—"} />
              <Detail label="Submitted" value={fmtDate(k.submittedAt)} />
              <Detail
                label="Payout account"
                value={k.bankAccount ? `${k.bankAccount.bankName ?? "Bank"}${k.bankAccount.accountName ? ` · ${k.bankAccount.accountName}` : ""}` : "—"}
              />
              {k.govIdUrl && (
                <div>
                  <p className="text-xs text-ink/45">Document</p>
                  <a href={k.govIdUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
                    View upload <Icon name="arrow-right" size={13} className="-rotate-45" />
                  </a>
                </div>
              )}
            </div>
            {k.reason && <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700">{k.reason}</p>}
          </div>
        ))}

        {queue.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Icon name="check" size={24} />
            </span>
            <p className="mt-3 font-bold">Nothing to review</p>
            <p className="mt-1 text-sm text-ink/50">No identity checks are waiting on a decision.</p>
          </div>
        )}
      </div>

      {rejecting && <RejectModal submission={rejecting} onClose={() => setRejecting(null)} />}
    </>
  );
}

function RejectModal({ submission, onClose }: { submission: KycSubmission; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return setError("A reason is required — it's shown to the applicant.");
    setError("");
    startTransition(async () => {
      const res = await rejectKyc(submission.id, reason.trim());
      if (res.ok) onClose();
      else setError(res.error);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">Reject verification</p>
          <button onClick={onClose} className="text-ink/40 hover:text-ink"><Icon name="close" size={20} /></button>
        </div>
        <p className="mt-1 text-sm text-ink/50">
          {`${submission.user.firstName} ${submission.user.lastName}`} will see this reason and can resubmit.
        </p>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The ID number didn't match the name on file."
            className="min-h-28 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand"
            maxLength={500}
          />
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-ink/15 py-3 text-sm font-bold hover:bg-ink/5">Cancel</button>
            <button type="submit" disabled={pending} className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">
              {pending ? "Rejecting…" : "Reject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className="p-5">
        <p className="text-sm text-ink/50">{label}</p>
        <p className="mt-1.5 text-2xl font-bold">{value}</p>
      </div>
      <div className="h-1.5 w-full bg-brand" />
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-ink/45">{label}</p>
      <p className={`mt-1 text-sm font-bold ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
