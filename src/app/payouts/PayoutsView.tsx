"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { adminPayouts, payoutSummary } from "@/lib/dashboard";

const AUDIENCES = ["All", "Affiliate", "Vendor", "Influencer"] as const;
const PILLS = ["All", "Review", "Scheduled", "Paid", "Failed"] as const;
const statusPill: Record<string, string> = {
  Scheduled: "bg-indigo-100 text-indigo-700",
  Review: "bg-amber-100 text-amber-700",
  Paid: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-600",
};

export default function PayoutsView() {
  const router = useRouter();
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>("All");
  const [pill, setPill] = useState<(typeof PILLS)[number]>("All");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adminPayouts.filter((p) => {
      const ma = audience === "All" || p.type === audience;
      const mp = pill === "All" || p.status === pill;
      const mq = !q || `${p.ref} ${p.type}`.toLowerCase().includes(q);
      return ma && mp && mq;
    });
  }, [audience, pill, query]);

  const exportCsv = () => {
    const header = ["Batch", "Type", "Run Date", "Recipients", "Total", "Status"];
    const lines = rows.map((p) => [p.ref, p.type, p.runDate, p.recipients, p.total.replace(/,/g, ""), p.status].join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "payouts.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">Payouts</h1>
          <p className="mt-1 text-sm text-ink/55">Weekly Monday batches · manual review, approve, release</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/10">
          <Icon name="download" size={17} /> Export CSV
        </button>
      </div>

      <div className="mt-6 flex rounded-2xl bg-ink/5 p-1.5">
        {AUDIENCES.map((a) => (
          <button key={a} onClick={() => setAudience(a)} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${audience === a ? "bg-white shadow-sm" : "text-ink/55 hover:text-ink"}`}>
            {a === "All" ? "All" : `${a}s`}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <SummaryCard label="Queued for Monday" value={payoutSummary.queued} sub={payoutSummary.queuedSub} accent="bg-brand" />
        <SummaryCard label="Paid last cycle" value={payoutSummary.paidLastCycle} sub="Paid last cycle" accent="bg-green-500" />
        <SummaryCard label="Failed transfers" value={`${payoutSummary.failed}`} sub={`Requires retry — ${payoutSummary.failedRef}`} accent="bg-orange-500" />
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-bold">Payouts</p>
            <p className="text-sm text-ink/50">Latest activity across all channels</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search batches" className="h-12 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-14 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand" />
              <span className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand/15 text-brand"><Icon name="search" size={17} /></span>
            </div>
            <button className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink/15 px-5 text-sm font-bold text-ink/70 transition-colors hover:bg-ink/5"><Icon name="filter" size={17} /> Filter</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {PILLS.map((p) => (
              <button key={p} onClick={() => setPill(p)} className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${pill === p ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"}`}>{p}</button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                <th className="py-3.5 pr-4 font-bold">Batch</th>
                <th className="px-4 py-3.5 font-bold">Type</th>
                <th className="px-4 py-3.5 font-bold">Run Date</th>
                <th className="px-4 py-3.5 text-right font-bold">Recipients</th>
                <th className="px-4 py-3.5 text-right font-bold">Total</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {rows.map((p) => (
                <tr key={p.ref} className="transition-colors hover:bg-ink/[0.02]">
                  <td className="py-4 pr-4 font-mono text-xs font-bold text-ink/80">{p.ref}</td>
                  <td className="px-4 py-4 text-ink/70">{p.type}</td>
                  <td className="px-4 py-4 text-ink/60">{p.runDate}</td>
                  <td className="px-4 py-4 text-right tabular-nums">{p.recipients}</td>
                  <td className="px-4 py-4 text-right font-bold tabular-nums">{p.total}</td>
                  <td className="px-4 py-4"><span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusPill[p.status]}`}>{p.status}</span></td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => router.push(`/payouts/${p.ref}`)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"><Icon name="eye" size={15} /> View</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-sm text-ink/45">No payout batches match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className="p-6">
        <p className="text-sm text-ink/55">{label}</p>
        <p className="mt-2 text-[28px] font-bold leading-none">{value}</p>
        <p className="mt-2 text-xs text-ink/50">{sub}</p>
      </div>
      <div className={`h-1.5 w-full ${accent}`} />
    </div>
  );
}
