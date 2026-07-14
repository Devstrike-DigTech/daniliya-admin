"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { type CampaignScope } from "@/lib/dashboard";
import { useCampaigns } from "./CampaignsContext";
import CampaignForm from "./CampaignForm";

const statusPill: Record<string, string> = {
  Live: "bg-green-100 text-green-700",
  Scheduled: "bg-indigo-100 text-indigo-700",
  Draft: "bg-ink/10 text-ink/55",
  Paused: "bg-amber-100 text-amber-700",
  Ended: "bg-ink/10 text-ink/45",
};
const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export default function CampaignsView() {
  const router = useRouter();
  const { campaigns, addCampaign } = useCampaigns();
  const [scope, setScope] = useState<CampaignScope>("Platform");
  const [open, setOpen] = useState(false);

  const rows = campaigns.filter((c) => c.scope === scope);

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

      {/* Scope toggle */}
      <div className="mt-6 flex rounded-2xl bg-ink/5 p-1.5">
        {(["Platform", "Vendor"] as CampaignScope[]).map((s) => (
          <button key={s} onClick={() => setScope(s)} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${scope === s ? "bg-white shadow-sm" : "text-ink/55 hover:text-ink"}`}>
            {s} campaign{s === "Vendor" ? "s" : ""}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => {
          const pct = c.budget ? Math.min(100, Math.round((c.spent / c.budget) * 100)) : 0;
          return (
            <div key={c.id} className="rounded-2xl border border-ink/10 bg-white p-6">
              <div className="flex items-start justify-between">
                <p className="text-xs text-ink/45">{c.id}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusPill[c.status]}`}>{c.status}</span>
              </div>
              <p className="mt-2 text-lg font-bold">{c.title}</p>
              <p className="text-sm text-ink/50">{c.product} · {c.type}</p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink/55">Spent</span>
                  <span className="font-bold">{naira(c.spent)} / {naira(c.budget)}</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-ink/8">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-ink/55">Conversions</span><span className="font-bold">{c.conversions}</span></div>
                <div className="flex items-center justify-between"><span className="text-ink/55">Window</span><span className="text-ink/70">{c.windowStart} → {c.windowEnd}</span></div>
              </div>

              <button onClick={() => router.push(`/campaigns/${c.id}`)} className="mt-5 w-full rounded-xl bg-brand py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
                View Brief
              </button>
            </div>
          );
        })}
        {rows.length === 0 && <p className="col-span-full py-12 text-center text-sm text-ink/45">No {scope.toLowerCase()} campaigns yet.</p>}
      </div>

      {open && (
        <CampaignForm
          mode="create"
          onClose={() => setOpen(false)}
          onCreate={(input, status) => {
            const created = addCampaign(input, status);
            setOpen(false);
            router.push(`/campaigns/${created.id}`);
          }}
        />
      )}
    </>
  );
}
