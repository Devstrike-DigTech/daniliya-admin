"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import {
  type Vendor,
  vendorBestProduct,
  vendorProductRows,
  vendorOrderRows,
  vendorPayoutRows,
} from "@/lib/dashboard";

const TABS = ["Overview", "Products", "Orders", "Finance"] as const;
const initials = (n: string) => n.split(/[\s&]+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const card = "rounded-2xl border border-ink/10 bg-white p-6";

const statusChip: Record<string, string> = {
  Approved: "bg-green-500/20 text-green-300",
  Pending: "bg-amber-500/20 text-amber-300",
  Rejected: "bg-red-500/20 text-red-300",
};

export default function VendorDetail({ vendor: v }: { vendor: Vendor }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const suspended = v.status === "Rejected";
  const best = vendorBestProduct(v);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/vendors" className="mt-1.5 text-ink/60 hover:text-ink"><Icon name="arrow-left" size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold sm:text-[28px]">{v.name}</h1>
            <p className="mt-0.5 text-sm text-ink/50">{v.code} · {v.category}</p>
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
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand text-lg font-bold text-ink">{initials(v.name)}</span>
            <div>
              <p className="text-lg font-bold">{v.name}</p>
              <p className="text-sm text-white/60">{v.category} · {v.city} · Onboarded {v.onboarded}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusChip[v.status]}`}>{v.status}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">Take rate {v.takeRate}%</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold"><Icon name="star" size={12} className="text-brand" /> {v.rating}/5 · {v.reviews} reviews</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/15"><Icon name="message" size={16} /> Message</button>
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
        <MetricCard label="30-day GMV" value={v.gmv30} sub={`${v.orders30} orders`} />
        <MetricCard label="Platform earned" value={v.platformEarned} sub={`Lifetime ${v.lifetimeEarned}`} />
        <MetricCard label="Attributed orders" value={`${v.attributedOrders}`} sub={v.attributionSub} />
        <MetricCard label="Pending payout" value={v.pendingPayout} sub={v.nextPayout !== "—" ? `Next: ${v.nextPayout}` : "No payout due"} gold />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${tab === t ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"}`}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className={card}>
              <p className="font-bold">Business &amp; contact</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field icon="user" label="Legal name" value={v.legalName} />
                <Field icon="shield-check" label="RC number" value={v.rc} />
                <CopyField icon="mail" label="Email" value={v.email} />
                <Field icon="phone" label="Phone" value={v.phone} />
                <Field icon="pin" label="Address" value={v.address} full />
                <Field icon="calendar" label="Onboarded" value={v.onboarded} />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={`https://wa.me/${v.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-200">WhatsApp <Icon name="arrow-right" size={14} className="-rotate-45" /></a>
                <a href={`mailto:${v.email}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#6d3fa0]/10 px-4 py-2 text-sm font-bold text-[#6d3fa0] hover:bg-[#6d3fa0]/20">Send email <Icon name="arrow-right" size={14} className="-rotate-45" /></a>
              </div>
            </div>

            <div className={card}>
              <p className="font-bold">Best-selling product (30d)</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 text-brand"><Icon name="package" size={20} /></span>
                  <div>
                    <p className="font-bold">{best.name}</p>
                    <p className="text-xs text-ink/50">{best.sold} sold · {best.revenue} revenue</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink/45">Platform take</p>
                  <p className="font-bold">{best.take}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={card}>
              <p className="font-bold">Commission &amp; terms</p>
              <div className="mt-4 space-y-3 text-sm">
                <Row label="Platform take" value={`${v.takeRate}%`} />
                <Row label="Payout cycle" value={v.payoutCycle} />
                <Row label="Category" value={v.category} />
              </div>
            </div>
            <div className={card}>
              <p className="font-bold">Bank details</p>
              <p className="mt-3 text-xl font-bold">GTBank ****4412</p>
              <p className="mt-1 text-sm text-ink/50">{v.status === "Approved" ? "Verified · Last payout 2026-06-23" : "Unverified"}</p>
            </div>
          </div>
        </div>
      )}

      {tab === "Products" && (
        <div className={`mt-6 ${card}`}>
          <p className="font-bold">Products · {v.products}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                  <th className="py-3 pr-4 font-bold">Product</th>
                  <th className="px-4 py-3 text-right font-bold">Price</th>
                  <th className="px-4 py-3 text-right font-bold">Stock</th>
                  <th className="px-4 py-3 text-right font-bold">Sold 30d.</th>
                  <th className="px-4 py-3 text-right font-bold">Revenue</th>
                  <th className="px-4 py-3 font-bold">Programs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {vendorProductRows(v).map((p) => (
                  <tr key={p.name} className="hover:bg-ink/[0.02]">
                    <td className="py-4 pr-4 font-bold">{p.name}</td>
                    <td className="px-4 py-4 text-right tabular-nums">{p.price}</td>
                    <td className="px-4 py-4 text-right tabular-nums">{p.stock}</td>
                    <td className="px-4 py-4 text-right tabular-nums">{p.sold}</td>
                    <td className="px-4 py-4 text-right font-bold tabular-nums">{p.revenue}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {p.programs.map((prog) => (
                          <span key={prog} className={`rounded-full px-2.5 py-1 text-xs font-bold ${prog === "Affiliate" ? "bg-brand/12 text-brand" : "bg-[#6d3fa0]/12 text-[#6d3fa0]"}`}>{prog}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Orders" && (
        <div className={`mt-6 ${card}`}>
          <p className="font-bold">Recent orders</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                  <th className="py-3 pr-4 font-bold">Order</th>
                  <th className="px-4 py-3 font-bold">Customer</th>
                  <th className="px-4 py-3 text-right font-bold">Revenue</th>
                  <th className="px-4 py-3 font-bold">Channel</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {vendorOrderRows(v).map((o) => (
                  <tr key={o.ref} className="hover:bg-ink/[0.02]">
                    <td className="py-4 pr-4 font-mono text-xs font-bold text-ink/80">{o.ref}</td>
                    <td className="px-4 py-4 font-bold">{o.customer}</td>
                    <td className="px-4 py-4 text-right font-bold tabular-nums">{o.revenue}</td>
                    <td className="px-4 py-4 text-ink/70">{o.channel}</td>
                    <td className="px-4 py-4"><StatusPill status={o.status} /></td>
                    <td className="px-4 py-4 text-ink/60">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Finance" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.6fr]">
          <div className={card}>
            <p className="font-bold">Platform earnings</p>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="30-day GMV" value={v.gmv30} />
              <Row label="Platform take (30d)" value={v.platformEarned} />
              <Row label="Lifetime GMV" value={lifetimeGmv(v)} />
              <Row label="Lifetime platform earned" value={v.lifetimeEarned} />
            </div>
          </div>
          <div className={card}>
            <p className="font-bold">Payout history</p>
            {vendorPayoutRows(v).length ? (
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
                    {vendorPayoutRows(v).map((p) => (
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
              <p className="mt-4 text-sm text-ink/45">No payouts — this vendor isn&apos;t approved yet.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MetricCard({ label, value, sub, gold }: { label: string; value: string; sub?: string; gold?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${gold ? "border-brand bg-brand text-white" : "border-ink/10 bg-white"}`}>
      <p className={`text-sm ${gold ? "text-white/80" : "text-ink/55"}`}>{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {sub && <p className={`mt-1 text-xs ${gold ? "text-white/70" : "text-ink/45"}`}>{sub}</p>}
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/8 pb-3 last:border-0 last:pb-0">
      <span className="text-ink/55">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
function Field({ icon, label, value, full }: { icon?: string; label: string; value: string; full?: boolean }) {
  return (
    <div className={`rounded-xl border border-ink/12 px-4 py-2.5 ${full ? "sm:col-span-2" : ""}`}>
      <p className="flex items-center gap-1.5 text-xs text-ink/45">{icon && <Icon name={icon} size={13} />} {label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}
function StatusPill({ status }: { status: string }) {
  const green = ["Live", "Delivered", "Confirmed", "Paid"].includes(status);
  const amber = ["Under review", "Packed", "Shipped"].includes(status);
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${green ? "bg-green-100 text-green-700" : amber ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{status}</span>;
}
function lifetimeGmv(v: Vendor) {
  const earned = Number(v.lifetimeEarned.replace(/[^\d]/g, ""));
  const gmv = Math.round(earned / (v.takeRate / 100));
  return `₦${gmv.toLocaleString("en-NG")}`;
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
