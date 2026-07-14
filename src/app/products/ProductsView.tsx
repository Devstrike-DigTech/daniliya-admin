"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Icon from "@/components/Icon";
import {
  adminProducts,
  productSummary,
  productImage,
  productGallery,
  type AdminProduct,
  type ProductScope,
} from "@/lib/dashboard";

const STATUSES = ["All", "Published", "Pending", "Rejected"] as const;
const CATEGORIES = ["All", ...Array.from(new Set(adminProducts.map((p) => p.category)))];
const statusPill: Record<string, string> = {
  Published: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
  Pending: "bg-amber-100 text-amber-700",
};

export default function ProductsView() {
  const router = useRouter();
  const [scope, setScope] = useState<ProductScope>("Platform");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [cat, setCat] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [modal, setModal] = useState<AdminProduct | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adminProducts.filter((p) => {
      const msc = p.scope === scope;
      const mq = !q || `${p.name} ${p.vendor} ${p.category}`.toLowerCase().includes(q);
      const ms = status === "All" || p.status === status;
      const mc = cat === "All" || p.category === cat;
      return msc && mq && ms && mc;
    });
  }, [scope, query, status, cat]);

  const exportCsv = () => {
    const header = ["Product", "Scope", "Category", "Vendor", "Price", "Status"];
    const lines = rows.map((p) => [p.name, p.scope, p.category, p.vendor, p.price.replace(/,/g, ""), p.status].join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "products.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">Products</h1>
          <p className="mt-1 text-sm text-ink/55">Marketplace-wide catalogue moderation</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-brand px-5 py-3 text-sm font-bold text-brand transition-colors hover:bg-brand/10">
          <Icon name="download" size={17} /> Export CSV
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total products" value={`${productSummary.total}`} icon="package" accent="bg-brand" soft="bg-brand/15 text-brand" />
        <SummaryCard label="Total published" value={`${productSummary.published}`} icon="check" accent="bg-green-500" soft="bg-green-500/15 text-green-600" />
        <SummaryCard label="Total Sales from products" value={productSummary.salesFromProducts} icon="chart" accent="bg-orange-500" soft="bg-orange-500/15 text-orange-600" />
        <SummaryCard label="Total profit from sales" value={productSummary.feeProfit} icon="wallet" accent="bg-[#6d3fa0]" soft="bg-[#6d3fa0]/15 text-[#6d3fa0]" />
      </div>

      {/* Scope toggle */}
      <div className="mt-6 flex rounded-2xl bg-ink/5 p-1.5">
        {(["Platform", "Vendor"] as ProductScope[]).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${scope === s ? "bg-white shadow-sm" : "text-ink/55 hover:text-ink"}`}
          >
            {s} Products
          </button>
        ))}
      </div>

      {/* Search + Filter row */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
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
                  {CATEGORIES.map((c) => (
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

      {/* Status pills */}
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

      {/* Card grid */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
            <div className="relative aspect-[16/10] bg-ink/[0.04]">
              <Image src={productImage(p.name)} alt={p.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
            </div>
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-ink/40">{p.source}</p>
              <p className="mt-1 text-lg font-bold">{p.name}</p>
              <p className="mt-1 text-sm text-ink/60">{p.price}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusPill[p.status]}`}>{p.status}</span>
                <button
                  onClick={() => (p.status === "Pending" ? setModal(p) : router.push(`/products/${p.id}`))}
                  className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline"
                >
                  Manage <Icon name="arrow-right" size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="col-span-full py-12 text-center text-sm text-ink/45">No products match your filters.</p>}
      </div>

      {/* Moderation modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setModal(null)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-ink/45">{modal.id.toUpperCase()}</p>
                <p className="text-xl font-bold">{modal.name} - {modal.price}</p>
                <p className="text-sm text-ink/55">{modal.category}</p>
              </div>
              <button onClick={() => setModal(null)} className="text-ink/40 hover:text-ink"><Icon name="close" size={20} /></button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {productGallery(modal.name).map((src, k) => (
                <div key={k} className="relative aspect-square overflow-hidden rounded-xl">
                  <Image src={src} alt={`${modal.name} ${k + 1}`} fill sizes="160px" className="object-cover" />
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ModalField label="Sales Price" value={modal.salesPrice} />
              <ModalField label="Cost Price" value={modal.costPrice} />
              <ModalField label="Stock on hand" value={`${modal.stock}`} />
              <ModalField label="Minimum Stock level" value={`${modal.minStock}`} />
              <div className="rounded-xl bg-ink/[0.03] px-4 py-3 sm:col-span-2">
                <p className="text-xs text-ink/45">Est. margin</p>
                <p className="mt-0.5 text-lg font-bold">{modal.marginPct}%</p>
                <p className="text-xs text-ink/50">Profit per unit: {modal.profitPerUnit}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"><Icon name="check" size={16} /> Approve</button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"><Icon name="close" size={16} /> Reject</button>
            </div>
          </div>
        </div>
      )}
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
function ModalField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink/[0.03] px-4 py-3">
      <p className="text-xs text-ink/45">{label}</p>
      <p className="mt-0.5 font-bold">{value}</p>
    </div>
  );
}
