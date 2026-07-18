"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

/** GET /admin/bookings */
export type AdminBooking = {
  ref: string;
  status: string;
  service: string | null;
  name: string;
  email: string;
  phone: string;
  description: string;
  city: string | null;
  address: string | null;
  budget: string | null;
  quotedAmount: string | null;
  preferredDate: string | null;
  attachments: string[];
  adminNote: string | null;
  cancelReason: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
};

// BookingStatus enum (API): REQUESTED · CONFIRMED · IN_PROGRESS · COMPLETED · CANCELLED
const STATUSES = ["All", "REQUESTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
const statusPill: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};
const servicePill: Record<string, string> = {
  "Dry cleaning": "bg-amber-100 text-amber-700",
  "Industrial cleaning": "bg-[#6d3fa0]/12 text-[#6d3fa0]",
  Laundry: "bg-orange-100 text-orange-700",
  Fumigation: "bg-green-100 text-green-700",
};

const label = (v: string) => v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " ");
const naira = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });

export default function BookingsView({ bookings }: { bookings: AdminBooking[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      const mq = !q || `${b.ref} ${b.name} ${b.service ?? ""} ${b.phone}`.toLowerCase().includes(q);
      const ms = status === "All" || b.status === status;
      return mq && ms;
    });
  }, [bookings, query, status]);

  const summary = useMemo(() => {
    const completedValue = bookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((n, b) => n + Number(b.quotedAmount ?? 0), 0);
    return {
      requested: bookings.filter((b) => b.status === "REQUESTED").length,
      confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
      inProgress: bookings.filter((b) => b.status === "IN_PROGRESS").length,
      completedValue,
    };
  }, [bookings]);

  const exportCsv = () => {
    const header = ["Booking", "Date", "Customer", "City", "Phone", "Status", "Service", "Quoted"];
    const lines = rows.map((b) =>
      [b.ref, shortDate(b.createdAt), b.name, b.city ?? "", b.phone, b.status, b.service ?? "", b.quotedAmount ?? ""].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bookings.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">Service bookings</h1>
          <p className="mt-1 text-sm text-ink/55">Cleaning, fumigation, laundry — all service jobs</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/10">
          <Icon name="download" size={17} /> Export CSV
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Requested" value={`${summary.requested}`} icon="calendar" accent="bg-brand" soft="bg-brand/15 text-brand" />
        <SummaryCard label="Confirmed" value={`${summary.confirmed}`} icon="calendar" accent="bg-green-500" soft="bg-green-500/15 text-green-600" />
        <SummaryCard label="In progress" value={`${summary.inProgress}`} icon="calendar" accent="bg-orange-500" soft="bg-orange-500/15 text-orange-600" />
        <SummaryCard label="Completed value" value={naira(summary.completedValue)} icon="calendar" accent="bg-green-500" soft="bg-green-500/15 text-green-600" />
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-bold">Recent Bookings</p>
            <p className="text-sm text-ink/50">Latest activity across all channels</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bookings"
                className="h-12 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-14 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand"
              />
              <span className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand/15 text-brand">
                <Icon name="search" size={17} />
              </span>
            </div>
            <button className="inline-flex h-12 items-center gap-2 rounded-xl border border-ink/15 px-5 text-sm font-bold text-ink/70 transition-colors hover:bg-ink/5">
              <Icon name="filter" size={17} /> Filter
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${status === s ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"}`}>{s === "All" ? s : label(s)}</button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                <th className="py-3.5 pr-4 font-bold">Booking</th>
                <th className="px-4 py-3.5 font-bold">Date</th>
                <th className="px-4 py-3.5 font-bold">Customer</th>
                <th className="px-4 py-3.5 font-bold">Phone number</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 font-bold">Service type</th>
                <th className="px-4 py-3.5 font-bold">Attachment</th>
                <th className="px-4 py-3.5 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {rows.map((b) => (
                <tr key={b.ref} className="transition-colors hover:bg-ink/[0.02]">
                  <td className="py-4 pr-4 font-mono text-xs font-bold text-ink/80">{b.ref}</td>
                  <td className="px-4 py-4 text-ink/60">{shortDate(b.createdAt)}</td>
                  <td className="px-4 py-4">
                    <p className="font-bold">{b.name}</p>
                    <p className="text-xs text-ink/45">{b.city ?? "—"}</p>
                  </td>
                  <td className="px-4 py-4 text-ink/70">{b.phone}</td>
                  <td className="px-4 py-4"><span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusPill[b.status] ?? "bg-ink/8 text-ink/60"}`}>{label(b.status)}</span></td>
                  <td className="px-4 py-4">
                    {b.service
                      ? <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${servicePill[b.service] ?? "bg-ink/8 text-ink/60"}`}>{b.service}</span>
                      : <span className="text-ink/45">—</span>}
                  </td>
                  <td className="px-4 py-4">
                    {b.attachments.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink/[0.06] text-ink/30"><Icon name="package" size={16} /></span>
                        {b.attachments.length > 1 && <span className="text-xs font-bold text-ink/50">+{b.attachments.length - 1}</span>}
                      </div>
                    ) : (
                      <span className="text-ink/45">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => router.push(`/bookings/${b.ref}`)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90">
                      <Icon name="eye" size={15} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-ink/45">No bookings match your search.</td></tr>
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
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${soft}`}><Icon name={icon} size={18} /></span>
        </div>
        <p className="mt-3 text-[26px] font-bold leading-none">{value}</p>
      </div>
      <div className={`h-1.5 w-full ${accent}`} />
    </div>
  );
}
