import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import Countdown from "@/components/Countdown";
import { apiFetchSafe } from "@/lib/api";
import ActionButton from "@/components/ActionButton";
import { approveBatch, cancelBatch, holdBatch, retryBatch } from "../actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  return { title: ref };
}

type PayoutCheck = { label: string; passed: boolean };
type PayoutItem = {
  id: string;
  beneficiary: string;
  amount: string;
  status: string;
  transfer: { status: string } | null;
};
type AdminPayoutDetail = {
  ref: string;
  audience: string;
  status: string;
  total: string;
  scheduledDate: string;
  checks: PayoutCheck[];
  items: PayoutItem[];
};

const naira = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
const fmtRun = (v: string) =>
  new Date(v).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });

// ── Per-status presentation ──────────────────────────────────
const headPill: Record<string, string> = {
  SCHEDULED: "bg-indigo-100 text-indigo-700",
  REVIEW: "bg-amber-100 text-amber-700",
  HELD: "bg-orange-100 text-orange-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-600",
  CANCELLED: "bg-ink/10 text-ink/60",
};
const headLabel: Record<string, string> = {
  SCHEDULED: "Scheduled",
  REVIEW: "Awaiting review",
  HELD: "On hold",
  PAID: "Released",
  FAILED: "Transfer failed",
  CANCELLED: "Cancelled",
};

// Hero card varies by status: dark countdown (Scheduled/Review), green released (Paid), red failed (Failed).
function heroFor(status: string, runDate: string, failCount: number) {
  switch (status) {
    case "PAID":
      return { bg: "bg-green-700", label: "Released", icon: "check", timer: "", note: `Paid ${runDate}`, stripe: false };
    case "FAILED":
      return { bg: "bg-red-700", label: "Transfer failed", icon: "close", timer: "", note: `${failCount} recipients failed · retry required`, stripe: false };
    case "CANCELLED":
      return { bg: "bg-coal", label: "Cancelled", icon: "close", timer: "", note: "This batch was cancelled", stripe: false };
    case "HELD":
      return { bg: "bg-coal", label: "On hold", icon: "clock", timer: "", note: `Held · was scheduled ${runDate}`, stripe: true };
    case "REVIEW":
      return { bg: "bg-coal", label: "Pending approval", icon: "wallet", timer: "", note: "Awaiting compliance sign-off before scheduling", stripe: true };
    default:
      return { bg: "bg-coal", label: "Next payout", icon: "wallet", timer: "live", note: `Scheduled ${runDate}`, stripe: true };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const batch = await apiFetchSafe<AdminPayoutDetail>(`/admin/payouts/${ref}`);
  if (!batch) notFound();

  const status = batch.status;
  const recipients = batch.items ?? [];
  const checks = batch.checks ?? [];
  const failCount = recipients.filter((r) => r.status === "FAILED").length;
  const runDate = fmtRun(batch.scheduledDate);
  const hero = heroFor(status, runDate, failCount);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/payouts" className="mt-1.5 text-ink/60 hover:text-ink"><Icon name="arrow-left" size={20} /></Link>
          <div>
            <h1 className="font-mono text-2xl font-bold sm:text-[28px]">{batch.ref}</h1>
            <div className="mt-2">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${headPill[status] ?? "bg-ink/10 text-ink/60"}`}>
                {headLabel[status] ?? status}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink/50">{batch.audience} batch · {recipients.length} recipients · runs {runDate}</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/10">
          <Icon name="download" size={17} /> Download receipt (CSV)
        </button>
      </div>

      {/* Status hero card */}
      <div className={`relative mt-6 overflow-hidden rounded-2xl ${hero.bg} p-6 text-white sm:p-8`}>
        {hero.stripe && (
          <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-24 w-40 opacity-50 [background-image:repeating-linear-gradient(45deg,var(--color-brand)_0_4px,transparent_4px_10px)]" />
        )}
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={`flex items-center gap-2 font-bold ${status === "SCHEDULED" || status === "REVIEW" ? "text-brand" : "text-white/85"}`}>
              <Icon name={hero.icon} size={16} /> {hero.label}
            </p>
            <p className="mt-2 text-3xl font-bold">{naira(batch.total)}</p>
            <p className="mt-1 text-sm text-white/70">{hero.note}</p>
          </div>
          {hero.timer === "live" ? (
            <Countdown className="font-mono text-4xl font-bold tracking-widest text-white/90 sm:text-5xl" />
          ) : hero.timer ? (
            <p className="font-mono text-4xl font-bold tracking-widest text-white/90 sm:text-5xl">{hero.timer}</p>
          ) : null}
        </div>
      </div>

      {/* Compliance checks */}
      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <p className="font-bold">Compliance checks</p>
        {checks.length ? (
          <div className="mt-4 space-y-3">
            {checks.map((c) => (
              <div key={c.label} className="flex items-center justify-between border-b border-ink/8 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-ink/60">{c.label}</span>
                {c.passed ? (
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-green-600"><Icon name="check" size={15} /> Pass</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-red-600"><Icon name="close" size={15} /> Fail</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink/45">No compliance checks recorded.</p>
        )}
      </div>

      {/* Recipients */}
      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <p className="font-bold">Recipients</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                <th className="py-3 pr-4 font-bold">User name</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 text-right font-bold">Total expected payouts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {recipients.map((r) => (
                <tr key={r.id}>
                  <td className="py-3.5 pr-4 font-bold">{r.beneficiary}</td>
                  <td className="px-4 py-3.5 text-ink/70">{batch.audience}</td>
                  <td className="px-4 py-3.5 text-right font-bold tabular-nums">{naira(r.amount)}</td>
                </tr>
              ))}
              {recipients.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-sm text-ink/45">No recipients in this batch.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status-specific actions */}
      <PayoutActions status={status} batchRef={batch.ref} />
    </>
  );
}

function PayoutActions({ status, batchRef }: { status: string; batchRef: string }) {
  if (status === "PAID") {
    return (
      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
        <Icon name="check" size={18} /> This batch has been released — no further action required.
      </div>
    );
  }
  if (status === "REVIEW") {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ActionButton
          action={approveBatch.bind(null, batchRef)}
          icon="check"
          variant="success"
          confirm="Approve and schedule this batch? This initiates real transfers to every beneficiary in it."
        >
          Approve &amp; schedule
        </ActionButton>
        <ActionButton
          action={cancelBatch.bind(null, batchRef)}
          icon="close"
          variant="danger"
          confirm="Cancel this batch? Nobody in it will be paid this run."
        >
          Reject batch
        </ActionButton>
      </div>
    );
  }
  if (status === "FAILED") {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ActionButton action={retryBatch.bind(null, batchRef)} icon="share" variant="primary">
          Retry failed transfers
        </ActionButton>
        <ActionButton
          action={cancelBatch.bind(null, batchRef)}
          icon="close"
          variant="danger"
          confirm="Cancel this batch? Nobody in it will be paid this run."
        >
          Cancel Payout
        </ActionButton>
      </div>
    );
  }
  if (status === "CANCELLED") {
    return (
      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-ink/15 bg-ink/[0.03] px-5 py-4 text-sm font-bold text-ink/60">
        <Icon name="close" size={18} /> This batch was cancelled — no further action required.
      </div>
    );
  }
  // Scheduled / Held
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <ActionButton
        action={holdBatch.bind(null, batchRef)}
        icon="clock"
        variant="outline"
        confirm="Put this batch on hold? Transfers will not go out until it is released."
      >
        Hold Batch
      </ActionButton>
      <ActionButton
        action={cancelBatch.bind(null, batchRef)}
        icon="close"
        variant="danger"
        confirm="Cancel this batch? Nobody in it will be paid this run."
      >
        Cancel Payout
      </ActionButton>
    </div>
  );
}
