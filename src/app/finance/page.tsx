import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { financeStats, financeSeries } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Finance" };

export default function FinancePage() {
  const peak = Math.max(...financeSeries.map((d) => Math.max(d.revenue, d.profit)));
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

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
          <p className="text-sm text-white/60">Total Revenue</p>
          <p className="mt-2 text-[28px] font-bold leading-none">₦12,180,000</p>
          <p className="mt-2 text-sm font-bold text-green-400">+24%</p>
        </div>
        {financeStats.map((s) => (
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

      {/* Revenue vs Profits chart */}
      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-bold">Revenue vs Profits in the last 7 days</p>
          <div className="flex items-center gap-5 text-sm font-bold">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-brand" /> Revenue</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-coal" /> Profits</span>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <div className="flex h-64 flex-col justify-between py-1 text-right text-[11px] text-ink/40">
            {[...gridLines].reverse().map((g) => (
              <span key={g}>₦{(peak * g * 0.04).toFixed(1)}M</span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative h-64">
              <div className="absolute inset-0 flex flex-col justify-between">
                {gridLines.map((g) => (
                  <div key={g} className="border-t border-dashed border-ink/8" />
                ))}
              </div>
              <div className="absolute inset-0 flex items-stretch gap-4">
                {financeSeries.map((d) => (
                  <div key={d.day} className="flex h-full flex-1 items-end justify-center gap-1.5">
                    <div className="w-1/2 rounded-t-lg bg-brand" style={{ height: `${(d.revenue / peak) * 100}%` }} title={`Revenue ₦${(d.revenue * 0.04).toFixed(1)}M`} />
                    <div className="w-1/2 rounded-t-lg bg-coal" style={{ height: `${(d.profit / peak) * 100}%` }} title={`Profit ₦${(d.profit * 0.04).toFixed(1)}M`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex gap-4">
              {financeSeries.map((d) => (
                <span key={d.day} className="flex-1 text-center text-xs text-ink/45">{d.day}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
