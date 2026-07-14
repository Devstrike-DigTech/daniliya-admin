import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import Countdown from "@/components/Countdown";
import { adminPayouts, payoutRecipients, type PayoutStatus } from "@/lib/dashboard";

export function generateStaticParams() {
  return adminPayouts.map((p) => ({ ref: p.ref }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  return { title: ref };
}

// ── Per-status presentation ──────────────────────────────────
const headPill: Record<PayoutStatus, string> = {
  Scheduled: "bg-indigo-100 text-indigo-700",
  Review: "bg-amber-100 text-amber-700",
  Paid: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-600",
};
const headLabel: Record<PayoutStatus, string> = {
  Scheduled: "Scheduled for Monday 9AM",
  Review: "Awaiting review",
  Paid: "Released",
  Failed: "Transfer failed",
};

// Hero card varies by status: dark countdown (Scheduled/Review), green released (Paid), red failed (Failed).
function heroFor(status: PayoutStatus, total: string, failCount: number) {
  switch (status) {
    case "Paid":
      return { bg: "bg-green-700", label: "Released", icon: "check", timer: "", note: "Paid Mon, Jul 6 · 9:00 AM", stripe: false };
    case "Failed":
      return { bg: "bg-red-700", label: "Transfer failed", icon: "close", timer: "", note: `${failCount} recipients failed · retry required`, stripe: false };
    case "Review":
      return { bg: "bg-coal", label: "Pending approval", icon: "wallet", timer: "", note: "Awaiting compliance sign-off before scheduling", stripe: true };
    default:
      return { bg: "bg-coal", label: "Next payout", icon: "wallet", timer: "live", note: "Scheduled Mon, Jul 6 · 9:00 AM", stripe: true };
  }
}

// Compliance checks — the failed batch has a failed float check; others all pass.
function checksFor(status: PayoutStatus) {
  return [
    { label: "KYC verified on all recipients", pass: true },
    { label: "Bank accounts validated", pass: status !== "Failed" },
    { label: "Sufficient float on Paystack", pass: status !== "Failed" },
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const batch = adminPayouts.find((p) => p.ref === ref);
  if (!batch) notFound();
  const status = batch.status;
  const recipients = payoutRecipients(batch);
  const failCount = 3;
  const hero = heroFor(status, batch.total, failCount);
  const checks = checksFor(status);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/payouts" className="mt-1.5 text-ink/60 hover:text-ink"><Icon name="arrow-left" size={20} /></Link>
          <div>
            <h1 className="font-mono text-2xl font-bold sm:text-[28px]">{batch.ref}</h1>
            <div className="mt-2">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${headPill[status]}`}>{headLabel[status]}</span>
            </div>
            <p className="mt-2 text-sm text-ink/50">{batch.type} batch · {batch.recipients} recipients · runs {batch.runDate}</p>
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
            <p className={`flex items-center gap-2 font-bold ${status === "Scheduled" || status === "Review" ? "text-brand" : "text-white/85"}`}>
              <Icon name={hero.icon} size={16} /> {hero.label}
            </p>
            <p className="mt-2 text-3xl font-bold">{batch.total}</p>
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
        <div className="mt-4 space-y-3">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center justify-between border-b border-ink/8 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-ink/60">{c.label}</span>
              {c.pass ? (
                <span className="inline-flex items-center gap-1 text-sm font-bold text-green-600"><Icon name="check" size={15} /> Pass</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm font-bold text-red-600"><Icon name="close" size={15} /> Fail</span>
              )}
            </div>
          ))}
        </div>
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
              {recipients.map((r, i) => (
                <tr key={i}>
                  <td className="py-3.5 pr-4 font-bold">{r.name}</td>
                  <td className="px-4 py-3.5 text-ink/70">{r.type}</td>
                  <td className="px-4 py-3.5 text-right font-bold tabular-nums">{r.expected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status-specific actions */}
      <PayoutActions status={status} />
    </>
  );
}

function PayoutActions({ status }: { status: PayoutStatus }) {
  if (status === "Paid") {
    return (
      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
        <Icon name="check" size={18} /> This batch has been released — no further action required.
      </div>
    );
  }
  if (status === "Review") {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
          <Icon name="check" size={16} /> Approve &amp; schedule
        </button>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100">
          <Icon name="close" size={16} /> Reject batch
        </button>
      </div>
    );
  }
  if (status === "Failed") {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
          <Icon name="share" size={16} /> Retry failed transfers
        </button>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100">
          <Icon name="close" size={16} /> Cancel Payout
        </button>
      </div>
    );
  }
  // Scheduled
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50">
        <Icon name="clock" size={16} /> Hold Batch
      </button>
      <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100">
        <Icon name="close" size={16} /> Cancel Payout
      </button>
    </div>
  );
}
