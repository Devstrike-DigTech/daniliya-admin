"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

/** GET /admin/orders — see docs: ref, status, channel, customer, total, payment, createdAt. */
export type AdminOrder = {
  ref: string;
  status: string;
  channel: string;
  customer: string | null;
  total: string;
  payment: { method: string; status: string } | null;
  createdAt: string;
};

// OrderStatus enum (API): PENDING · CONFIRMED · PROCESSING · SHIPPED · DELIVERED · COMPLETED · CANCELLED · REFUNDED
const statusPill: Record<string, string> = {
  PENDING: "bg-indigo-100 text-indigo-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-[#6d3fa0]/12 text-[#6d3fa0]",
  DELIVERED: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
  REFUNDED: "bg-ink/10 text-ink/60",
};

const label = (v: string) => v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " ");
const naira = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });

export default function OrdersView({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => !q || `${o.ref} ${o.customer ?? ""} ${o.channel}`.toLowerCase().includes(q));
  }, [orders, query]);

  const summary = useMemo(
    () => ({
      total: orders.length,
      newOrders: orders.filter((o) => o.status === "PENDING").length,
      completed: orders.filter((o) => o.status === "COMPLETED" || o.status === "DELIVERED").length,
    }),
    [orders],
  );

  const exportCsv = () => {
    const header = ["Order", "Date", "Customer", "Channel", "Total", "Status"];
    const lines = rows.map((o) =>
      [o.ref, shortDate(o.createdAt), o.customer ?? "", o.channel, o.total, o.status].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">Orders</h1>
          <p className="mt-1 text-sm text-ink/55">Every marketplace order across all vendors</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/10">
          <Icon name="download" size={17} /> Export CSV
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Orders" value={`${summary.total}`} icon="package" accent="bg-brand" soft="bg-brand/15 text-brand" />
        <SummaryCard label="New orders" value={`${summary.newOrders}`} icon="package" accent="bg-indigo-500" soft="bg-indigo-500/15 text-indigo-600" />
        <SummaryCard label="Completed" value={`${summary.completed}`} icon="check" accent="bg-green-500" soft="bg-green-500/15 text-green-600" />
        {/* No fee/profit figure is exposed by /admin/orders — intentionally blank. */}
        <SummaryCard label="Total profit from fees" value="—" icon="wallet" accent="bg-[#6d3fa0]" soft="bg-[#6d3fa0]/15 text-[#6d3fa0]" />
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">Recent orders</p>
            <p className="text-sm text-ink/50">Latest activity across all channels</p>
          </div>
          <div className="relative sm:w-80">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders"
              className="h-11 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-12 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand"
            />
            <span className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Icon name="search" size={15} />
            </span>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                <th className="py-3.5 pr-4 font-bold">Order</th>
                <th className="px-4 py-3.5 font-bold">Date</th>
                <th className="px-4 py-3.5 font-bold">Customer</th>
                <th className="px-4 py-3.5 font-bold">Total</th>
                <th className="px-4 py-3.5 font-bold">Channel</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {rows.map((o) => (
                <tr key={o.ref} className="transition-colors hover:bg-ink/[0.02]">
                  <td className="py-4 pr-4 font-mono text-xs font-bold text-ink/80">{o.ref}</td>
                  <td className="px-4 py-4 text-ink/60">{shortDate(o.createdAt)}</td>
                  <td className="px-4 py-4">
                    <p className="font-bold">{o.customer ?? "—"}</p>
                    <p className="text-xs text-ink/45">
                      {o.payment ? `${label(o.payment.method)} · ${label(o.payment.status)}` : "—"}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-bold">{naira(o.total)}</td>
                  <td className="px-4 py-4 text-ink/70">{label(o.channel)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusPill[o.status] ?? "bg-ink/8 text-ink/60"}`}>{label(o.status)}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => router.push(`/orders/${o.ref}`)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90">
                      <Icon name="eye" size={15} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-ink/45">No orders match your search.</td></tr>
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
