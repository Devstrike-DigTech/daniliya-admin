import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { apiFetchSafe } from "@/lib/api";

export const metadata: Metadata = { title: "Finance" };

type FinanceStats = {
  totalPaidOut: string;
  commissionsDisbursed: string;
  commissionsOwed: string;
};

type Reconciliation = {
  ledgerNet: string;
  walletTotal: string;
  drift: string;
  balanced: boolean;
};

const naira = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

export default async function FinancePage() {
  const [stats, recon] = await Promise.all([
    apiFetchSafe<FinanceStats>("/admin/finance/stats"),
    apiFetchSafe<Reconciliation>("/admin/payouts/reconciliation"),
  ]);

  const cards = [
    {
      label: "Commissions disbursed",
      value: stats ? naira(stats.commissionsDisbursed) : "—",
      sub: "Paid to affiliates, creators and vendors",
      accent: "bg-green-500",
    },
    {
      label: "Commissions owed",
      value: stats ? naira(stats.commissionsOwed) : "—",
      sub: "Accrued and not yet disbursed",
      accent: "bg-amber-500",
    },
    {
      label: "Ledger drift",
      value: recon ? naira(recon.drift) : "—",
      sub: recon ? (recon.balanced ? "Ledger balanced against wallets" : "Drift detected — investigate") : "Reconciliation unavailable",
      accent: recon?.balanced === false ? "bg-red-500" : "bg-[#6d3fa0]",
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">Finance</h1>
          <p className="mt-1 text-sm text-ink/55">Revenue data and trends</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/10">
          <Icon name="download" size={17} /> Export ledger
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-coal p-6 text-white">
          <p className="text-sm text-white/60">Total paid out</p>
          <p className="mt-2 text-[28px] font-bold leading-none">{stats ? naira(stats.totalPaidOut) : "—"}</p>
          {/* No period-over-period growth figure in /admin/finance/stats. */}
          <p className="mt-2 text-sm font-bold text-white/40">—</p>
        </div>
        {cards.map((s) => (
          <div key={s.label} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
            <div className="p-6">
              <p className="text-sm text-ink/55">{s.label}</p>
              <p className="mt-2 text-[28px] font-bold leading-none">{s.value}</p>
              <p className="mt-2 text-xs text-ink/50">{s.sub}</p>
            </div>
            <div className={`h-1.5 w-full ${s.accent}`} />
          </div>
        ))}
      </div>

      {/* Revenue vs Profits — no time-series endpoint on the API yet. */}
      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-bold">Revenue vs Profits in the last 7 days</p>
          <div className="flex items-center gap-5 text-sm font-bold">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-brand" /> Revenue</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-coal" /> Profits</span>
          </div>
        </div>

        <div className="mt-6 flex h-64 items-center justify-center rounded-xl border border-dashed border-ink/12 text-sm text-ink/45">
          No revenue time-series available from the API yet.
        </div>
      </div>
    </>
  );
}
