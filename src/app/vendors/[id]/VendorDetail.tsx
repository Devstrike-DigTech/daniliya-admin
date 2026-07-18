"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

/** Shape returned by GET /admin/vendors/{id}. */
export type VendorDetailData = {
  id: string;
  userId: string;
  businessName: string;
  productCategory: string | null;
  bankDetailsJson: Record<string, unknown> | null;
  takeRateBps: number | null;
  isApproved: boolean;
  approvedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    status: string;
  };
  _count: {
    products: number;
    reviews: number;
  };
};

const TABS = ["Overview", "Products", "Orders", "Finance"] as const;
const initials = (n: string) => n.split(/[\s&]+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const card = "rounded-2xl border border-ink/10 bg-white p-6";
const EMPTY = "—";
const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : EMPTY;

/** bankDetailsJson is free-form on the API; render only what is actually present. */
function bankLabel(json: Record<string, unknown> | null): string {
  if (!json) return EMPTY;
  const bank = typeof json.bankName === "string" ? json.bankName : null;
  const acct = typeof json.accountNumber === "string" ? json.accountNumber : null;
  if (bank && acct) return `${bank} ****${acct.slice(-4)}`;
  return bank ?? acct ?? EMPTY;
}

const statusChip: Record<string, string> = {
  Approved: "bg-green-500/20 text-green-300",
  Pending: "bg-amber-500/20 text-amber-300",
  Rejected: "bg-red-500/20 text-red-300",
};

export default function VendorDetail({ vendor: v }: { vendor: VendorDetailData }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const status = v.isApproved ? "Approved" : v.rejectedReason ? "Rejected" : "Pending";
  const suspended = status === "Rejected" || v.user.status !== "ACTIVE";
  const takeRate = v.takeRateBps != null ? `${v.takeRateBps / 100}%` : EMPTY;
  const category = v.productCategory ?? EMPTY;
  const contactName = `${v.user.firstName} ${v.user.lastName}`;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/vendors" className="mt-1.5 text-ink/60 hover:text-ink"><Icon name="arrow-left" size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold sm:text-[28px]">{v.businessName}</h1>
            <p className="mt-0.5 text-sm text-ink/50">{v.id} · {category}</p>
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
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand text-lg font-bold text-ink">{initials(v.businessName)}</span>
            <div>
              <p className="text-lg font-bold">{v.businessName}</p>
              {/* No city on the vendor payload. */}
              <p className="text-sm text-white/60">{category} · Onboarded {fmtDate(v.createdAt)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusChip[status]}`}>{status}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">Take rate {takeRate}</span>
                {/* No average rating on the API — only a review count. */}
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold"><Icon name="star" size={12} className="text-brand" /> {EMPTY} · {v._count.reviews} reviews</span>
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

      {/* Stats — GMV / earnings / payout aggregates are not on this endpoint */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="30-day GMV" value={EMPTY} />
        <MetricCard label="Platform earned" value={EMPTY} />
        <MetricCard label="Attributed orders" value={EMPTY} />
        <MetricCard label="Pending payout" value={EMPTY} gold />
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
                <Field icon="user" label="Contact name" value={contactName} />
                {/* No RC number or address on the vendor payload. */}
                <Field icon="shield-check" label="RC number" value={EMPTY} />
                <CopyField icon="mail" label="Email" value={v.user.email} />
                <Field icon="phone" label="Phone" value={v.user.phone ?? EMPTY} />
                <Field icon="pin" label="Address" value={EMPTY} full />
                <Field icon="calendar" label="Onboarded" value={fmtDate(v.createdAt)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {v.user.phone && (
                  <a href={`https://wa.me/${v.user.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-200">WhatsApp <Icon name="arrow-right" size={14} className="-rotate-45" /></a>
                )}
                <a href={`mailto:${v.user.email}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#6d3fa0]/10 px-4 py-2 text-sm font-bold text-[#6d3fa0] hover:bg-[#6d3fa0]/20">Send email <Icon name="arrow-right" size={14} className="-rotate-45" /></a>
              </div>
            </div>

            <div className={card}>
              <p className="font-bold">Best-selling product (30d)</p>
              {/* No sales breakdown on GET /admin/vendors/{id}. */}
              <p className="mt-3 text-sm text-ink/45">No sales data yet.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className={card}>
              <p className="font-bold">Commission &amp; terms</p>
              <div className="mt-4 space-y-3 text-sm">
                <Row label="Platform take" value={takeRate} />
                {/* No payout cycle field on the API. */}
                <Row label="Payout cycle" value={EMPTY} />
                <Row label="Category" value={category} />
              </div>
            </div>
            <div className={card}>
              <p className="font-bold">Bank details</p>
              <p className="mt-3 text-xl font-bold">{bankLabel(v.bankDetailsJson)}</p>
              <p className="mt-1 text-sm text-ink/50">
                {v.isApproved ? `Approved ${fmtDate(v.approvedAt)}` : (v.rejectedReason ?? "Awaiting approval")}
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "Products" && (
        <div className={`mt-6 ${card}`}>
          <p className="font-bold">Products · {v._count.products}</p>
          {/* The detail endpoint returns a product count only, not the product rows. */}
          <p className="mt-4 text-sm text-ink/45">No product details yet.</p>
        </div>
      )}

      {tab === "Orders" && (
        <div className={`mt-6 ${card}`}>
          <p className="font-bold">Recent orders</p>
          {/* No per-vendor order data on this endpoint. */}
          <p className="mt-4 text-sm text-ink/45">No orders yet.</p>
        </div>
      )}

      {tab === "Finance" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.6fr]">
          <div className={card}>
            <p className="font-bold">Platform earnings</p>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="30-day GMV" value={EMPTY} />
              <Row label="Platform take (30d)" value={EMPTY} />
              <Row label="Lifetime GMV" value={EMPTY} />
              <Row label="Lifetime platform earned" value={EMPTY} />
            </div>
          </div>
          <div className={card}>
            <p className="font-bold">Payout history</p>
            <p className="mt-4 text-sm text-ink/45">No payout history yet.</p>
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
