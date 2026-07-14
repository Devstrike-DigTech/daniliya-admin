"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import {
  type Influencer,
  influencerStats,
  influencerSocial,
  influencerCampaignRows,
  influencerPayoutRows,
  influencerPayoutSummary,
  influencerContentRows,
} from "@/lib/dashboard";

const TABS = ["Overview", "Campaigns", "Payouts", "Content"] as const;
const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2);
const card = "rounded-2xl border border-ink/10 bg-white p-6";

const statusChip: Record<string, string> = {
  Approved: "bg-green-500/20 text-green-300",
  Pending: "bg-amber-500/20 text-amber-300",
  Rejected: "bg-red-500/20 text-red-300",
};

export default function InfluencerDetail({ influencer: i }: { influencer: Influencer }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const s = influencerStats(i);
  const suspended = i.status === "Rejected";

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/influencers" className="mt-1.5 text-ink/60 hover:text-ink">
            <Icon name="arrow-left" size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold sm:text-[28px]">{i.name}</h1>
            <p className="mt-0.5 text-sm text-ink/50">{i.id} · {i.handle}</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/10">
          <Icon name="download" size={17} /> Export CSV
        </button>
      </div>

      {/* Hero */}
      <div className="relative mt-6 overflow-hidden rounded-2xl bg-coal p-6 text-white">
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-40 w-64 opacity-40 [background-image:radial-gradient(rgba(212,160,23,0.6)_1.2px,transparent_1.2px)] [background-size:12px_12px]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand text-lg font-bold text-ink">{initials(i.name)}</span>
            <div>
              <p className="text-lg font-bold">{i.name}</p>
              <p className="text-sm text-white/60">{s.role} · {i.city} · Joined {i.joined}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusChip[i.status]}`}>{i.status}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">{i.followers} followers</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">{s.engagement} engagement</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/15"><Icon name="message" size={16} /> Message</button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/15"><Icon name="medal" size={16} /> Offer retainer</button>
            {suspended ? (
              <button className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"><Icon name="check" size={16} /> Reinstate</button>
            ) : (
              <button className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"><Icon name="ban" size={16} /> Suspend user</button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Lifetime earnings" value={s.lifetimeEarnings} />
        <MetricCard label="Conversions" value={`${s.conversions}`} />
        <MetricCard label="Followers across all platforms" value={s.followers} />
        <MetricCard label="Pending payout" value={s.pendingPayout} gold />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${tab === t ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"}`}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="mt-6 space-y-6">
          <div className={card}>
            <p className="font-bold">Contact details</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <CopyField icon="mail" label="Email" value={i.email} />
              <CopyField icon="phone" label="Phone" value={i.phone} />
              <CopyField icon="pin" label="City" value={i.city} />
              <CopyField icon="calendar" label="Joined" value={i.joined} />
              <CopyField icon="bank" label="Bank" value={s.bank} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={`https://wa.me/${i.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-200">WhatsApp <Icon name="arrow-right" size={14} className="-rotate-45" /></a>
              <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#6d3fa0]/10 px-4 py-2 text-sm font-bold text-[#6d3fa0] hover:bg-[#6d3fa0]/20">Send email <Icon name="arrow-right" size={14} className="-rotate-45" /></a>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={card}>
              <p className="font-bold">Social presence</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {influencerSocial(i).map((soc) => (
                  <div key={soc.platform} className="rounded-xl border border-ink/10 p-3">
                    <p className="text-xs text-ink/45">{soc.platform} · {soc.handle}</p>
                    <p className="mt-1 text-sm font-bold">{soc.stat}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={card}>
              <p className="font-bold">Bank details</p>
              <p className="mt-3 text-xl font-bold">{s.bankFull}</p>
              <p className="mt-1 text-sm text-ink/50">{s.bankNote}</p>
            </div>
          </div>
        </div>
      )}

      {tab === "Campaigns" && (
        <div className={`mt-6 ${card}`}>
          <p className="font-bold">Campaign performance</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                  <th className="py-3 pr-4 font-bold">Campaign</th>
                  <th className="px-4 py-3 text-right font-bold">Posts</th>
                  <th className="px-4 py-3 text-right font-bold">Reach</th>
                  <th className="px-4 py-3 text-right font-bold">Conv.</th>
                  <th className="px-4 py-3 text-right font-bold">Earnings</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {influencerCampaignRows(i).map((c) => (
                  <tr key={c.campaign} className="hover:bg-ink/[0.02]">
                    <td className="py-4 pr-4">
                      <p className="font-bold">{c.campaign}</p>
                      <p className="text-xs text-ink/50">{c.brand}</p>
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">{c.posts}</td>
                    <td className="px-4 py-4 text-right tabular-nums">{c.reach}</td>
                    <td className="px-4 py-4 text-right tabular-nums">{c.conv}</td>
                    <td className="px-4 py-4 text-right font-bold tabular-nums">{c.earnings}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${c.status === "Live" ? "bg-green-100 text-green-700" : "bg-ink/8 text-ink/55"}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Payouts" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.6fr]">
          <div className={card}>
            <p className="font-bold">Summary</p>
            {(() => {
              const sum = influencerPayoutSummary(i);
              return (
                <div className="mt-4 space-y-3 text-sm">
                  <SumRow label="Payouts to date" value={`${sum.toDate}`} />
                  <SumRow label="Total paid" value={sum.totalPaid} />
                  <SumRow label="Pending release" value={sum.pendingRelease} />
                  <SumRow label="Last payout" value={sum.lastPayout} />
                </div>
              );
            })()}
          </div>
          <div className={card}>
            <p className="font-bold">Payout history</p>
            {influencerPayoutRows(i).length ? (
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
                    {influencerPayoutRows(i).map((p) => (
                      <tr key={p.batch}>
                        <td className="py-3 pr-4 font-mono text-xs">{p.batch}</td>
                        <td className="px-4 py-3 text-ink/60">{p.date}</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">{p.amount}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink/45">No payouts — this influencer isn&apos;t approved yet.</p>
            )}
          </div>
        </div>
      )}

      {tab === "Content" && (
        <div className={`mt-6 ${card}`}>
          <p className="font-bold">Recent content submissions</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {influencerContentRows(i).map((c) => (
              <div key={c.title} className="overflow-hidden rounded-2xl border border-ink/10">
                <div className="flex aspect-[4/3] items-center justify-center bg-ink/[0.06] text-ink/25"><Icon name="play" size={40} /></div>
                <div className="p-4">
                  <p className="font-bold">{c.title}</p>
                  <p className="mt-0.5 text-xs text-ink/50">
                    <span className="font-bold text-green-600">{c.status}</span> · {c.views}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
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

function MetricCard({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${gold ? "border-brand bg-brand text-white" : "border-ink/10 bg-white"}`}>
      <p className={`text-sm ${gold ? "text-white/80" : "text-ink/55"}`}>{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function CopyField({ icon, label, value }: { icon?: string; label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink/12 px-4 py-2.5">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs text-ink/45">{icon && <Icon name={icon} size={13} />} {label}</p>
        <p className="truncate text-sm font-bold">{value}</p>
      </div>
      <button onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); }} className="shrink-0 text-brand hover:text-ink" aria-label="Copy">
        <Icon name={copied ? "check" : "copy"} size={17} />
      </button>
    </div>
  );
}
