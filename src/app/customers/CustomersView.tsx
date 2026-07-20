"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

/** GET /admin/customers */
export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  orders: number;
  bookings: number;
  totalSpent: number;
};

// UserStatus (API): ACTIVE · GUEST · PENDING_VERIFICATION · SUSPENDED
const STATUSES = ["All", "ACTIVE", "GUEST", "SUSPENDED"] as const;
const statusPill: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  GUEST: "bg-ink/8 text-ink/60",
  PENDING_VERIFICATION: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-600",
};
const label = (v: string) => v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " ");
const naira = (v: number) => `₦${v.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
const joined = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

function SummaryCard({ label, value, icon, accent, soft }: { label: string; value: string; icon: string; accent: string; soft: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm text-ink/55">{label}</p>
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${soft}`}><Icon name={icon} size={18} /></span>
        </div>
        <p className="mt-3 text-[26px] font-bold leading-none">{value}</p>
      </div>
      <div className={`h-1.5 w-full ${accent}`} />
    </div>
  );
}

export default function CustomersView({ customers }: { customers: AdminCustomer[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      const mq = !q || `${c.name} ${c.email} ${c.phone ?? ""}`.toLowerCase().includes(q);
      const ms = status === "All" || c.status === status;
      return mq && ms;
    });
  }, [customers, query, status]);

  const summary = useMemo(
    () => ({
      total: customers.length,
      registered: customers.filter((c) => c.status === "ACTIVE").length,
      revenue: customers.reduce((n, c) => n + c.totalSpent, 0),
    }),
    [customers],
  );

  const exportCsv = () => {
    const header = ["Name", "Email", "Phone", "Status", "Orders", "Bookings", "Total spent", "Joined"];
    const lines = rows.map((c) =>
      [c.name, c.email, c.phone ?? "", c.status, c.orders, c.bookings, c.totalSpent, joined(c.createdAt)].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">Customers</h1>
          <p className="mt-1 text-sm text-ink/55">Everyone who shops the storefront — registered accounts and guest checkouts.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/10">
          <Icon name="download" size={17} /> Export CSV
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total customers" value={`${summary.total}`} icon="users" accent="bg-brand" soft="bg-brand/15 text-brand" />
        <SummaryCard label="Registered accounts" value={`${summary.registered}`} icon="check" accent="bg-green-500" soft="bg-green-500/15 text-green-600" />
        <SummaryCard label="Guest checkouts" value={`${summary.total - summary.registered}`} icon="user" accent="bg-blue-500" soft="bg-blue-500/15 text-blue-600" />
        <SummaryCard label="Lifetime revenue" value={naira(summary.revenue)} icon="wallet" accent="bg-[#6d3fa0]" soft="bg-[#6d3fa0]/15 text-[#6d3fa0]" />
      </div>

      {/* Search + status pills */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or phone"
            className="h-12 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-14 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand"
          />
          <span className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand/15 text-brand">
            <Icon name="search" size={17} />
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${status === s ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"}`}
          >
            {s === "All" ? s : label(s)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/45">
                <th className="px-6 py-3 font-bold">Customer</th>
                <th className="px-6 py-3 font-bold">Status</th>
                <th className="px-6 py-3 font-bold">Orders</th>
                <th className="px-6 py-3 font-bold">Bookings</th>
                <th className="px-6 py-3 font-bold">Total spent</th>
                <th className="px-6 py-3 font-bold">Joined</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {rows.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-ink/[0.02]">
                  <td className="px-6 py-3.5">
                    <p className="font-bold">{c.name}</p>
                    <p className="text-xs text-ink/50">{c.email}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusPill[c.status] ?? "bg-ink/8 text-ink/60"}`}>{label(c.status)}</span>
                  </td>
                  <td className="px-6 py-3.5 font-bold">{c.orders}</td>
                  <td className="px-6 py-3.5 text-ink/70">{c.bookings}</td>
                  <td className="px-6 py-3.5 font-bold">{naira(c.totalSpent)}</td>
                  <td className="px-6 py-3.5 text-ink/60">{joined(c.createdAt)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button onClick={() => router.push(`/customers/${c.id}`)} className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
                      View <Icon name="arrow-right" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-ink/45">No customers match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
