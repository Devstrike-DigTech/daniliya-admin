"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import CampaignForm from "./CampaignForm";

/** GET /admin/campaigns */
export type AdminCampaign = {
  id: string;
  title: string;
  brief: string | null;
  productIds: string[];
  payoutModel: "FLAT" | "COMMISSION";
  commissionRate: string | null;
  flatAmount: string | null;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "PAUSED" | "ENDED";
  createdAt: string;
  updatedAt: string;
  _count: { assignments: number };
};

/** GET /admin/products — only the fields the create form needs. */
export type CampaignProduct = { id: string; title: string };

// CampaignStatus enum (API): ACTIVE · PAUSED · ENDED
const statusPill: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-amber-100 text-amber-700",
  ENDED: "bg-ink/10 text-ink/45",
};

const FILTERS = ["All", "ACTIVE", "PAUSED", "ENDED"] as const;
type Filter = (typeof FILTERS)[number];

const label = (v: string) => v.charAt(0) + v.slice(1).toLowerCase();
const naira = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });

/** Payout terms are the only "what this campaign pays" data the API carries. */
export function payoutLine(c: Pick<AdminCampaign, "payoutModel" | "flatAmount" | "commissionRate">) {
  if (c.payoutModel === "FLAT") {
    return c.flatAmount ? `${naira(c.flatAmount)} per conversion · CPA` : "CPA";
  }
  return c.commissionRate ? `${Number(c.commissionRate)}% commission` : "Commission";
}

export default function CampaignsView({
  campaigns,
  products,
}: {
  campaigns: AdminCampaign[];
  products: CampaignProduct[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () => campaigns.filter((c) => filter === "All" || c.status === filter),
    [campaigns, filter],
  );

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">Growth campaigns</h1>
          <p className="mt-1 text-sm text-ink/55">Recruit affiliates and creators to push specific products</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
          <Icon name="plus" size={17} /> New Campaign
        </button>
      </div>

      {/* Status filter */}
      <div className="mt-6 flex rounded-2xl bg-ink/5 p-1.5">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${filter === f ? "bg-white shadow-sm" : "text-ink/55 hover:text-ink"}`}>
            {f === "All" ? "All campaigns" : label(f)}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => (
          <div key={c.id} className="rounded-2xl border border-ink/10 bg-white p-6">
            <div className="flex items-start justify-between">
              <p className="text-xs text-ink/45">{c.id.slice(0, 8).toUpperCase()}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusPill[c.status] ?? "bg-ink/10 text-ink/55"}`}>{label(c.status)}</span>
            </div>
            <p className="mt-2 text-lg font-bold">{c.title}</p>
            <p className="text-sm text-ink/50">{payoutLine(c)}</p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-ink/55">Creators assigned</span><span className="font-bold">{c._count.assignments}</span></div>
              <div className="flex items-center justify-between"><span className="text-ink/55">Window</span><span className="text-ink/70">{shortDate(c.startDate)} → {shortDate(c.endDate)}</span></div>
            </div>

            <button onClick={() => router.push(`/campaigns/${c.id}`)} className="mt-5 w-full rounded-xl bg-brand py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
              View Brief
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-ink/45">
            {filter === "All" ? "No campaigns yet." : `No ${label(filter).toLowerCase()} campaigns.`}
          </p>
        )}
      </div>

      {open && (
        <CampaignForm
          products={products}
          onClose={() => setOpen(false)}
          onCreated={(id) => {
            setOpen(false);
            router.push(`/campaigns/${id}`);
          }}
        />
      )}
    </>
  );
}
