"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import { productGallery, type AdminProduct } from "@/lib/dashboard";

const label = "mb-1.5 block text-sm font-bold";
const input = "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";

function StatFoot({ label, value }: { label: string; value: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className="p-5">
        <p className="text-sm text-ink/50">{label}</p>
        <p className="mt-1.5 text-xl font-bold">{value}</p>
      </div>
      <div className="h-1.5 w-full bg-brand" />
    </div>
  );
}

export default function ProductDetail({ product: p }: { product: AdminProduct }) {
  const [active, setActive] = useState(0);
  const [promote, setPromote] = useState(false);

  return (
    <>
      <div className="flex items-start gap-3">
        <Link href="/products" className="mt-1.5 text-ink/60 hover:text-ink"><Icon name="arrow-left" size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">{p.name} - {p.price}</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink/50">
            {p.category} <Icon name="star" size={14} className="text-brand" /> <span className="font-bold text-ink/70">{p.rating}</span> ({p.reviews})
          </p>
        </div>
      </div>

      {/* Gallery */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {productGallery(p.name).map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative aspect-[4/3] overflow-hidden rounded-2xl transition-all ${active === i ? "ring-2 ring-dashed ring-brand ring-offset-2" : "hover:opacity-90"}`}
          >
            <Image src={src} alt={`${p.name} ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Key stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatFoot label="Sales Price" value={p.salesPrice} />
        <StatFoot label="Stock on hand" value={`${p.stock}`} />
        <StatFoot label="Minimum stock level" value={`${p.minStock}`} />
        <StatFoot label="Profit per unit" value={p.profitPerUnit} />
      </div>

      {/* Sales performance */}
      <p className="mt-8 text-lg font-bold text-ink/70">Sales performance</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatFoot label="Units Sold" value={`${p.unitsSold}`} />
        <StatFoot label="Revenue" value={p.revenue} />
        <StatFoot label="Total Profit" value={p.totalProfit} />
        <StatFoot label="Channels" value={`${p.channels}`} />
      </div>

      {/* Operational settings */}
      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <p className="text-sm text-ink/50">Operational settings</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label}>Sale price (₦)</label>
            <input className={input} placeholder="Enter cost of item" defaultValue={p.salesPrice.replace("₦", "")} />
          </div>
          <div>
            <label className={label}>Unit of measurement</label>
            <select className={input} defaultValue="">
              <option value="" disabled>Select unit of measurement</option>
              <option>Piece</option><option>Set</option><option>Pack</option><option>Kg</option>
            </select>
          </div>
          <div>
            <label className={label}>Initial Stock</label>
            <input className={input} placeholder="Enter your current stock level" defaultValue={p.stock} />
          </div>
          <div>
            <label className={label}>Minimum stock level</label>
            <input className={input} placeholder="Enter your minimum stock level" defaultValue={p.minStock} />
          </div>
        </div>
        <label className="mt-5 flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={promote} onChange={(e) => setPromote(e.target.checked)} className="peer sr-only" />
          <span className="relative h-6 w-11 shrink-0 rounded-full bg-ink/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-brand peer-checked:after:translate-x-5" />
          <span className="text-sm text-ink/70">Allow your product to be eligible for promotion by top rated influencers &amp; affiliates</span>
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand/10 py-3.5 text-sm font-bold text-brand transition-colors hover:bg-brand/20">
          <Icon name="ban" size={16} /> Unlist temporarily
        </button>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100">
          <Icon name="close" size={16} /> Remove from marketplace
        </button>
      </div>
    </>
  );
}
