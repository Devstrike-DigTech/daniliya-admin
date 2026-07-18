import Link from "next/link";
import Icon from "@/components/Icon";
import { Card, StatTile, StatusBadge } from "@/components/widgets";
import { apiFetchSafe } from "@/lib/api";
import {
  // NOTE: still dummy — no API endpoint yet for the weekly revenue series,
  // the attention feed, or the queued-payout strip. See README "Not yet wired".
  weeklyRevenue,
  attentionItems,
  payoutBatches,
} from "@/lib/dashboard";

const toneDot: Record<string, string> = {
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  red: "bg-red-500",
};

const naira = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

type Overview = {
  gmv: string;
  orders: number;
  users: number;
  pendingPayouts: string;
  attribution: { channel: string; orders: number }[];
};

type OrderRow = {
  ref: string;
  customer?: string;
  channel: string;
  total: string;
  status: string;
  createdAt: string;
};

const CHANNEL_COLOR: Record<string, string> = {
  AFFILIATE: "bg-brand",
  INFLUENCER: "bg-[#6d3fa0]",
  WEB: "bg-blue-500",
};

export default async function CommandCentre() {
  const [overview, orders] = await Promise.all([
    apiFetchSafe<Overview>("/admin/overview"),
    apiFetchSafe<OrderRow[]>("/admin/orders"),
  ]);

  const stats = [
    { label: "GMV", value: overview ? naira(overview.gmv) : "—", icon: "trending-up", accent: "bg-brand", soft: "bg-brand text-white" },
    { label: "Orders", value: overview ? String(overview.orders) : "—", icon: "receipt", accent: "bg-green-500", soft: "bg-green-500 text-white" },
    { label: "Total users", value: overview ? String(overview.users) : "—", icon: "users", accent: "bg-blue-500", soft: "bg-blue-500 text-white" },
    { label: "Pending payouts", value: overview ? naira(overview.pendingPayouts) : "—", icon: "wallet", accent: "bg-[#6d3fa0]", soft: "bg-[#6d3fa0] text-white" },
  ];

  const totalAttributed = overview?.attribution.reduce((n, a) => n + a.orders, 0) ?? 0;
  const orderAttribution = (overview?.attribution ?? []).map((a) => ({
    label: a.channel.charAt(0) + a.channel.slice(1).toLowerCase(),
    pct: totalAttributed ? Math.round((a.orders / totalAttributed) * 100) : 0,
    color: CHANNEL_COLOR[a.channel] ?? "bg-ink/30",
  }));

  const recentOrders = (orders ?? []).slice(0, 5);

  const peak = Math.max(...weeklyRevenue.map((d) => d.value));
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">Command centre</h1>
          <p className="mt-1 text-sm text-ink/55">
            Live snapshot across marketplace, services, affiliates and creators.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/10">
            <Icon name="download" size={17} /> Export
          </button>
          <Link
            href="/payouts"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <Icon name="wallet" size={17} /> Review payouts
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatTile key={s.label} {...s} accentBottom />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue this week */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">Revenue this week</p>
              <p className="mt-0.5 text-sm text-ink/50">Total revenue earned from all streams</p>
            </div>
            <span className="text-lg font-bold text-brand">₦8,420,000</span>
          </div>

          <div className="mt-6 flex gap-4">
            {/* y-axis labels */}
            <div className="flex h-52 flex-col justify-between py-1 text-right text-[11px] text-ink/40">
              {[...gridLines].reverse().map((g) => (
                <span key={g}>₦{(peak * g * 0.04).toFixed(1)}M</span>
              ))}
            </div>

            {/* plot */}
            <div className="min-w-0 flex-1">
              <div className="relative h-52">
                {/* gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {gridLines.map((g) => (
                    <div key={g} className="border-t border-dashed border-ink/8" />
                  ))}
                </div>
                {/* bars */}
                <div className="absolute inset-0 flex items-end gap-3">
                  {weeklyRevenue.map((d) => (
                    <div key={d.day} className="group flex h-full flex-1 flex-col items-center justify-end">
                      <span className="mb-1.5 text-[11px] font-bold text-ink/0 transition-colors group-hover:text-ink/70">
                        ₦{(d.value * 0.04).toFixed(1)}M
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-brand/85 transition-all group-hover:bg-brand"
                        style={{ height: `${(d.value / peak) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* x-axis labels */}
              <div className="mt-2 flex gap-3">
                {weeklyRevenue.map((d) => (
                  <span key={d.day} className="flex-1 text-center text-xs text-ink/45">
                    {d.day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Order attribution */}
        <Card>
          <p className="font-bold">Order attribution</p>
          <p className="mt-1 text-sm text-ink/55">Channel share · last 30 days</p>
          <div className="mt-6 space-y-4">
            {orderAttribution.map((a) => (
              <div key={a.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">{a.label}</span>
                  <span className="text-ink/55">{a.pct}%</span>
                </div>
                <div className="mt-1.5 h-2.5 w-full rounded-full bg-ink/8">
                  <div className={`h-full rounded-full ${a.color}`} style={{ width: `${a.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
        {/* Attention required */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-coal shadow-sm">
          <div className="flex flex-1 flex-col p-6 text-white">
            <div className="flex items-center gap-2">
              <Icon name="alert" size={18} className="text-brand" />
              <p className="font-bold">Attention required</p>
            </div>
            <div className="mt-4 flex-1 space-y-2.5">
              {attentionItems.map((it) => (
                <Link
                  key={it.text}
                  href={it.href}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm transition-colors hover:bg-white/10"
                >
                  <span className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${toneDot[it.tone]}`} />
                    {it.text}
                  </span>
                  <Icon name="chevron-right" size={16} className="text-white/50" />
                </Link>
              ))}
            </div>
          </div>
          <div className="h-[3px] w-full bg-brand" />
        </div>

        {/* Payout batches queued */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
          <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center justify-between">
            <p className="font-bold">Payout batches queued</p>
            <Link href="/payouts" className="text-sm font-bold text-brand hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 flex-1 divide-y divide-ink/8">
            {payoutBatches.map((b) => (
              <div key={b.ref} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-bold">{b.audience}</p>
                  <p className="text-xs text-ink/50">
                    {b.ref} · {b.count} recipients
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{b.amount}</p>
                  <span
                    className={`text-xs font-bold ${
                      b.status === "Queued" ? "text-brand" : "text-amber-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          </div>
          <div className="h-[3px] w-full bg-brand" />
        </div>
      </div>

      {/* Latest orders */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <p className="font-bold">Latest orders</p>
          <Link href="/orders" className="text-sm font-bold text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-y border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
                <th className="px-6 py-3 font-bold">Order</th>
                <th className="px-6 py-3 font-bold">Customer</th>
                <th className="px-6 py-3 font-bold">Channel</th>
                <th className="px-6 py-3 font-bold">Total</th>
                <th className="px-6 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {recentOrders.map((o) => (
                <tr key={o.ref} className="transition-colors hover:bg-ink/[0.02]">
                  <td className="px-6 py-3.5">
                    <Link href={`/orders/${o.ref}`} className="font-mono text-xs font-bold text-brand hover:underline">
                      {o.ref}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 font-bold">{o.customer ?? "—"}</td>
                  <td className="px-6 py-3.5 text-ink/70">{o.channel}</td>
                  <td className="px-6 py-3.5 font-bold">{naira(o.total)}</td>
                  <td className="px-6 py-3.5"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-ink/45">
                    No orders yet.
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
