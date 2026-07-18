"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

/** Shape returned by GET /admin/vendors. */
export type VendorRow = {
  id: string;
  userId: string;
  businessName: string;
  productCategory: string | null;
  takeRateBps: number | null;
  isApproved: boolean;
  approvedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  };
};

const initials = (n: string) => n.split(/[\s&]+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const STATUSES = ["All", "Approved", "Pending", "Rejected"] as const;

const statusPill: Record<string, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-600",
};

/** Derived: the API exposes isApproved + rejectedReason, not a status enum. */
const reviewStatus = (v: VendorRow) =>
  v.isApproved ? "Approved" : v.rejectedReason ? "Rejected" : "Pending";

export default function VendorsView({ vendors }: { vendors: VendorRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [cat, setCat] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(vendors.map((v) => v.productCategory).filter((c): c is string => !!c)))],
    [vendors],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendors.filter((v) => {
      const mq =
        !q || `${v.businessName} ${v.productCategory ?? ""} ${v.user.email}`.toLowerCase().includes(q);
      const ms = status === "All" || reviewStatus(v) === status;
      const mc = cat === "All" || v.productCategory === cat;
      return mq && ms && mc;
    });
  }, [vendors, query, status, cat]);

  // Derived from live rows. Product counts and fee profit are not on /admin/vendors.
  const activeCount = vendors.filter((v) => v.isApproved).length;
  const awaitingCount = vendors.filter((v) => reviewStatus(v) === "Pending").length;

  const exportCsv = () => {
    const header = ["Vendor", "Category", "Contact", "Email", "Take rate (bps)", "Status"];
    const lines = rows.map((v) =>
      [
        v.businessName,
        v.productCategory ?? "",
        `${v.user.firstName} ${v.user.lastName}`,
        v.user.email,
        v.takeRateBps ?? "",
        reviewStatus(v),
      ].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vendors.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">Vendors</h1>
          <p className="mt-1 text-sm text-ink/55">Approve merchants, audit KYC, monitor performance</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/10">
          <Icon name="download" size={17} /> Export CSV
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Active Vendors" value={`${activeCount}`} icon="store" accent="bg-green-500" soft="bg-green-500/15 text-green-600" />
        <SummaryCard label="Awaiting review" value={`${awaitingCount}`} icon="clock" accent="bg-amber-500" soft="bg-amber-500/15 text-amber-600" />
        {/* Not derivable from /admin/vendors */}
        <SummaryCard label="Products Live" value="—" icon="package" accent="bg-orange-500" soft="bg-orange-500/15 text-orange-600" />
        <SummaryCard label="Total profit from fees" value="—" icon="wallet" accent="bg-blue-500" soft="bg-blue-500/15 text-blue-600" />
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vendors"
              className="h-12 w-full rounded-xl border border-ink/15 bg-white pl-4 pr-14 text-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand"
            />
            <span className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Icon name="search" size={17} />
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`inline-flex h-12 items-center gap-2 rounded-xl border px-5 text-sm font-bold transition-colors ${cat !== "All" || filterOpen ? "border-brand bg-brand/10 text-brand" : "border-ink/15 text-ink/70 hover:bg-ink/5"}`}
            >
              <Icon name="filter" size={17} /> Filter
              {cat !== "All" && <span className="ml-1 rounded-full bg-brand px-1.5 text-[10px] text-white">1</span>}
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-14 z-20 w-56 rounded-xl border border-ink/10 bg-white p-3 shadow-lg">
                  <p className="px-1 pb-2 text-xs font-bold uppercase tracking-wide text-ink/45">Category</p>
                  <div className="max-h-64 space-y-1 overflow-y-auto">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setCat(c); setFilterOpen(false); }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-bold transition-colors ${cat === c ? "bg-brand/10 text-brand" : "text-ink/70 hover:bg-ink/5"}`}
                      >
                        {c}
                        {cat === c && <Icon name="check" size={15} />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${status === s ? "bg-brand text-white" : "border border-ink/15 text-ink/60 hover:bg-ink/5"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                <th className="py-3.5 pr-4 font-bold">Vendor</th>
                <th className="px-4 py-3.5 font-bold">Category</th>
                <th className="px-4 py-3.5 font-bold">City</th>
                <th className="px-4 py-3.5 text-right font-bold">Products</th>
                <th className="px-4 py-3.5 text-right font-bold">Earnings</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {rows.map((v) => {
                const label = reviewStatus(v);
                return (
                  <tr key={v.id} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-sm font-bold text-brand">
                          {initials(v.businessName)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold">{v.businessName}</p>
                          <p className="truncate text-xs text-ink/45">{v.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-ink/70">{v.productCategory ?? <span className="text-ink/45">—</span>}</td>
                    {/* city / products / earnings: no field on /admin/vendors */}
                    <td className="px-4 py-4 text-ink/45">—</td>
                    <td className="px-4 py-4 text-right tabular-nums text-ink/45">—</td>
                    <td className="px-4 py-4 text-right font-bold tabular-nums text-ink/45">—</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusPill[label]}`}>{label}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button onClick={() => router.push(`/vendors/${v.id}`)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90">
                        <Icon name="eye" size={15} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-ink/45">No vendors match your filters.</td></tr>
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
