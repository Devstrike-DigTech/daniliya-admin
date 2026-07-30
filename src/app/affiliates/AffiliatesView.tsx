"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

/** Shape returned by GET /admin/affiliates. */
export type AffiliateRow = {
  id: string;
  userId: string;
  referralCode: string;
  tier: string;
  kycStatus: string;
  assessmentPassed: boolean;
  tutorialCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  };
};

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2);
const STATUSES = ["All", "Approved", "Rejected"] as const;

const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** kycStatus (PENDING | APPROVED | REJECTED) drives the displayed standing. */
const kycLabel = (s: string) => title(s);

const tierStyle: Record<string, string> = {
  GOLD: "bg-brand/15 text-brand",
  PLATINUM: "bg-[#6d3fa0]/12 text-[#6d3fa0]",
  SILVER: "bg-ink/8 text-ink/55",
  BRONZE: "bg-orange-500/12 text-orange-600",
};

const tierIcon: Record<string, string> = {
  PLATINUM: "trophy",
  GOLD: "medal",
};

export default function AffiliatesView({ affiliates }: { affiliates: AffiliateRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [tier, setTier] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const tiers = useMemo(
    () => ["All", ...Array.from(new Set(affiliates.map((a) => a.tier)))],
    [affiliates],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return affiliates.filter((a) => {
      const name = `${a.user.firstName} ${a.user.lastName}`;
      const mq = !q || `${name} ${a.referralCode} ${a.id} ${a.user.email}`.toLowerCase().includes(q);
      const ms = status === "All" || kycLabel(a.kycStatus) === status;
      const mt = tier === "All" || a.tier === tier;
      return mq && ms && mt;
    });
  }, [affiliates, query, status, tier]);

  // Derived from live rows. Payout totals have no field on /admin/affiliates.
  const activeCount = affiliates.filter((a) => a.isActive).length;
  const rejectedCount = affiliates.filter((a) => a.kycStatus === "REJECTED").length;

  const exportCsv = () => {
    const header = ["Affiliate", "ID", "Code", "Tier", "Email", "KYC status", "Active"];
    const lines = rows.map((a) =>
      [
        `${a.user.firstName} ${a.user.lastName}`,
        a.id,
        a.referralCode,
        a.tier,
        a.user.email,
        a.kycStatus,
        a.isActive ? "Yes" : "No",
      ].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "affiliates.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">Affiliates</h1>
          <p className="mt-1 text-sm text-ink/55">Approve KYC, monitor tiers, manage commissions</p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/10"
        >
          <Icon name="download" size={17} /> Export CSV
        </button>
      </div>

      {/* Summary cards — bottom accent */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Active Affiliates" value={`${activeCount}`} icon="users" accent="bg-green-500" soft="bg-green-500/15 text-green-600" />
        <SummaryCard label="Rejected affiliates" value={`${rejectedCount}`} icon="users" accent="bg-red-500" soft="bg-red-500/15 text-red-500" />
        {/* No payout aggregate on /admin/affiliates yet */}
        <SummaryCard label="Pending payouts" value="—" icon="wallet" accent="bg-orange-500" soft="bg-orange-500/15 text-orange-600" />
        <SummaryCard label="Lifetime payouts" value="—" icon="wallet" accent="bg-blue-500" soft="bg-blue-500/15 text-blue-600" />
      </div>

      {/* Container card */}
      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
        {/* Search + Filter row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search affiliates"
              className="h-12 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-14 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand"
            />
            <span className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Icon name="search" size={17} />
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`inline-flex h-12 items-center gap-2 rounded-xl border px-5 text-sm font-bold transition-colors ${
                tier !== "All" || filterOpen ? "border-brand bg-brand/10 text-brand" : "border-ink/15 text-ink/70 hover:bg-ink/5"
              }`}
            >
              <Icon name="filter" size={17} /> Filter
              {tier !== "All" && <span className="ml-1 rounded-full bg-brand px-1.5 text-[10px] text-white">1</span>}
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-14 z-20 w-56 rounded-xl border border-ink/10 bg-white p-3 shadow-lg">
                  <p className="px-1 pb-2 text-xs font-bold uppercase tracking-wide text-ink/45">Tier</p>
                  <div className="max-h-64 space-y-1 overflow-y-auto">
                    {tiers.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTier(t);
                          setFilterOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                          tier === t ? "bg-brand/10 text-brand" : "text-ink/70 hover:bg-ink/5"
                        }`}
                      >
                        {t === "All" ? t : title(t)}
                        {tier === t && <Icon name="check" size={15} />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                status === s ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                <th className="py-3.5 pr-4 font-bold">Affiliate</th>
                <th className="px-4 py-3.5 font-bold">Code</th>
                <th className="px-4 py-3.5 font-bold">Tier</th>
                <th className="px-4 py-3.5 text-right font-bold">Clicks</th>
                <th className="px-4 py-3.5 text-right font-bold">Conv</th>
                <th className="px-4 py-3.5 text-right font-bold">Earnings</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {rows.map((a) => {
                const name = `${a.user.firstName} ${a.user.lastName}`;
                const label = kycLabel(a.kycStatus);
                return (
                  <tr key={a.id} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-sm font-bold text-brand">
                          {initials(name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold">{name}</p>
                          <p className="truncate text-xs text-ink/45">{a.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-ink/70">{a.referralCode}</td>
                    <td className="px-4 py-4"><TierBadge tier={a.tier} /></td>
                    {/* clicks / conv / earnings: no field on /admin/affiliates */}
                    <td className="px-4 py-4 text-right tabular-nums text-ink/45">—</td>
                    <td className="px-4 py-4 text-right tabular-nums text-ink/45">—</td>
                    <td className="px-4 py-4 text-right font-bold tabular-nums text-ink/45">—</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        a.kycStatus === "VERIFIED" || a.kycStatus === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : a.kycStatus === "REJECTED"
                            ? "bg-red-100 text-red-600"
                            : a.kycStatus === "PENDING_MANUAL" || a.kycStatus === "SUBMITTED"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-ink/8 text-ink/50"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          a.kycStatus === "VERIFIED" || a.kycStatus === "APPROVED"
                            ? "bg-green-600"
                            : a.kycStatus === "REJECTED"
                              ? "bg-red-500"
                              : a.kycStatus === "PENDING_MANUAL" || a.kycStatus === "SUBMITTED"
                                ? "bg-amber-500"
                                : "bg-ink/40"
                        }`} />
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => router.push(`/affiliates/${a.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                      >
                        <Icon name="eye" size={15} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-ink/45">
                    No affiliates match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ label, value, icon, accent, soft }: { label: string; value: string; icon: string; accent: string; soft: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm text-ink/55">{label}</p>
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${soft}`}>
            <Icon name={icon} size={18} />
          </span>
        </div>
        <p className="mt-3 text-[26px] font-bold leading-none">{value}</p>
      </div>
      <div className={`h-1.5 w-full ${accent}`} />
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const style = tierStyle[tier];
  if (!style) {
    return <span className="inline-block rounded-full bg-ink/8 px-3 py-1 text-xs font-bold text-ink/45">{title(tier)}</span>;
  }
  const icon = tierIcon[tier];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${style}`}>
      {icon && <Icon name={icon} size={13} />} {title(tier)}
    </span>
  );
}
