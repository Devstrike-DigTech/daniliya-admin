"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import {
  type Affiliate,
  affiliatePayoutData,
  affiliateAssessment,
  affiliateProducts,
} from "@/lib/dashboard";

const TABS = ["Overview", "Products", "Payouts & Assessment"] as const;
const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2);

export default function AffiliateDetail({ affiliate: a }: { affiliate: Affiliate }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const suspended = a.state === "Suspended";

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/affiliates" className="mt-1.5 text-ink/60 hover:text-ink">
            <Icon name="arrow-left" size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold sm:text-[28px]">{a.name}</h1>
            <p className="mt-0.5 text-sm text-ink/50">{a.id} · {a.code}</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/10">
          <Icon name="download" size={17} /> Export CSV
        </button>
      </div>

      {/* Dark hero banner */}
      <div className="relative mt-6 overflow-hidden rounded-2xl bg-coal p-6 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-40 w-64 opacity-40 [background-image:radial-gradient(rgba(212,160,23,0.6)_1.2px,transparent_1.2px)] [background-size:12px_12px]"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand text-lg font-bold text-ink">
              {initials(a.name)}
            </span>
            <div>
              <p className="text-lg font-bold">{a.name}</p>
              <p className="text-sm text-white/60">Affiliate since {a.joined} · {a.city}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {a.tier !== "NIL" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/20 px-2.5 py-1 text-xs font-bold text-brand">
                    <Icon name={a.tier === "Platinum" ? "trophy" : "medal"} size={12} /> {a.tier} tier · {a.tierPct}%
                  </span>
                )}
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${suspended ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
                  {a.state}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/15">
              <Icon name="message" size={16} /> Message
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/15">
              <Icon name="medal" size={16} /> Change tier
            </button>
            {suspended ? (
              <button className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90">
                <Icon name="check" size={16} /> Reinstate
              </button>
            ) : (
              <button className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90">
                <Icon name="ban" size={16} /> Suspend user
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Lifetime earnings" value={a.lifetimeEarnings} />
        <MetricCard label="Conversions" value={`${a.conv}`} />
        <MetricCard label="Clicks" value={a.clicks.toLocaleString()} />
        <MetricCard label="Pending payout" value={a.pendingPayout} gold />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${
              tab === t ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <OverviewTab a={a} />}
      {tab === "Products" && <ProductsTab a={a} />}
      {tab === "Payouts & Assessment" && <PayoutsTab a={a} />}
    </>
  );
}

function MetricCard({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${gold ? "border-brand bg-brand text-white" : "border-ink/10 bg-white"}`}>
      <p className={`text-sm ${gold ? "text-white/80" : "text-ink/55"}`}>{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

const card = "rounded-2xl border border-ink/10 bg-white p-6";

function OverviewTab({ a }: { a: Affiliate }) {
  return (
    <div className="mt-6 space-y-6">
      <div className={card}>
        <p className="font-bold">Contact details</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CopyField icon="mail" label="Email" value={a.email} />
          <CopyField icon="phone" label="Phone" value={a.phone} />
          <CopyField icon="pin" label="City" value={a.city} />
          <CopyField icon="calendar" label="Joined" value={a.joined} />
          <CopyField icon="shield-check" label="NIN" value={a.nin} />
          <CopyField icon="bank" label="Bank" value={a.bank} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={`https://wa.me/${a.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700 transition-colors hover:bg-green-200">
            WhatsApp <Icon name="arrow-right" size={14} className="-rotate-45" />
          </a>
          <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#6d3fa0]/10 px-4 py-2 text-sm font-bold text-[#6d3fa0] transition-colors hover:bg-[#6d3fa0]/20">
            Send email <Icon name="arrow-right" size={14} className="-rotate-45" />
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={card}>
          <p className="font-bold">Performance snapshot</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Snap label="7-day clicks" value={`${a.sevenDayClicks}`} />
            <Snap label="7-day conv." value={`${a.sevenDayConv}`} />
            <Snap label="Refund rate" value={a.refundRate} />
            <Snap label="Assessment" value={`${a.assessment}/100`} />
          </div>
        </div>
        <div className={card}>
          <p className="font-bold">Referral link</p>
          <CopyField className="mt-4" label="" value={a.referral} mono />
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ a }: { a: Affiliate }) {
  const products = affiliateProducts(a);
  return (
    <div className={`mt-6 ${card}`}>
      <p className="font-bold">Products this affiliate promotes</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
              <th className="py-3 pr-4 font-bold">Product</th>
              <th className="px-4 py-3 text-right font-bold">Sold</th>
              <th className="px-4 py-3 text-right font-bold">Revenue</th>
              <th className="px-4 py-3 text-right font-bold">Commission</th>
              <th className="px-4 py-3 text-right font-bold">Last sale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {products.map((p, i) => (
              <tr key={i} className="hover:bg-ink/[0.02]">
                <td className="py-4 pr-4 font-bold">{p.name}</td>
                <td className="px-4 py-4 text-right tabular-nums">{p.sold}</td>
                <td className="px-4 py-4 text-right tabular-nums">{p.revenue}</td>
                <td className="px-4 py-4 text-right font-bold text-green-600 tabular-nums">{p.commission}</td>
                <td className="px-4 py-4 text-right text-ink/55">{p.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PayoutsTab({ a }: { a: Affiliate }) {
  const { summary, history, bank, bankNote } = affiliatePayoutData(a);
  const { score, date, breakdown } = affiliateAssessment(a);
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className={card}>
        <p className="font-bold">Summary</p>
        <div className="mt-4 space-y-3 text-sm">
          <SumRow label="Payouts to date" value={`${summary.toDate}`} />
          <SumRow label="Total paid" value={summary.totalPaid} />
          <SumRow label="Pending release" value={summary.pendingRelease} />
          <SumRow label="Last payout" value={summary.lastPayout} />
        </div>
      </div>

      <div className={card}>
        <p className="font-bold">Payout history</p>
        {history.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                  <th className="py-2.5 pr-4 font-bold">Batch</th>
                  <th className="px-4 py-2.5 font-bold">Date</th>
                  <th className="px-4 py-2.5 text-right font-bold">Amount</th>
                  <th className="px-4 py-2.5 text-right font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {history.map((h) => (
                  <tr key={h.batch}>
                    <td className="py-3 pr-4 font-mono text-xs">{h.batch}</td>
                    <td className="px-4 py-3 text-ink/60">{h.date}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums">{h.amount}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink/45">No payouts — this affiliate is rejected.</p>
        )}
      </div>

      <div className={card}>
        <p className="font-bold">Assessment score</p>
        <p className="mt-3 text-[34px] font-bold leading-none">
          {score}
          <span className="text-lg text-ink/40">/100</span>
        </p>
        <p className="mt-2 text-xs text-ink/50">Completed onboarding quiz on {date}</p>
        <div className="mt-4 space-y-3">
          {breakdown.map(([label, pct]) => (
            <div key={label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink/60">{label}</span>
                <span className="font-bold">{pct}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-ink/8">
                <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={card}>
        <p className="font-bold">Bank details</p>
        <p className="mt-3 text-xl font-bold">{bank}</p>
        <p className="mt-1 text-sm text-ink/50">{bankNote}</p>
      </div>
    </div>
  );
}

function Snap({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink/10 p-3">
      <p className="text-xs text-ink/45">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/8 pb-3 last:border-0 last:pb-0">
      <span className="text-ink/55">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function CopyField({
  icon,
  label,
  value,
  mono,
  className = "",
}: {
  icon?: string;
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border border-ink/12 px-4 py-2.5 ${className}`}>
      <div className="min-w-0">
        {label && (
          <p className="flex items-center gap-1.5 text-xs text-ink/45">
            {icon && <Icon name={icon} size={13} />} {label}
          </p>
        )}
        <p className={`truncate text-sm font-bold ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="shrink-0 text-brand transition-colors hover:text-ink"
        aria-label="Copy"
      >
        <Icon name={copied ? "check" : "copy"} size={17} />
      </button>
    </div>
  );
}
