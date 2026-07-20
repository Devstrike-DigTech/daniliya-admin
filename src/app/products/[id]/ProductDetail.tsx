"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import ActionButton from "@/components/ActionButton";
import { productGallery } from "@/lib/dashboard";
import ProductModeration from "../ProductModeration";
import { delistProduct, relistProduct } from "../actions";

export type AdminProductDetail = {
  id: string;
  vendorId: string | null;
  title: string;
  slug: string;
  description: string | null;
  price: string;
  commissionRate: string;
  stockQuantity: number;
  category: string | null;
  status: string;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
  vendor: { id: string; businessName: string } | null;
  images: { id: string; url: string; sortOrder: number }[];
  _count: { orderItems: number; reviews: number };
};

const naira = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

// Mirrors ProductsView — keep the status vocabulary consistent across pages.
const statusPill: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  DRAFT: "bg-ink/8 text-ink/60",
  REJECTED: "bg-red-100 text-red-600",
  REMOVED: "bg-ink/10 text-ink/50",
};
const statusLabel = (v: string) =>
  v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " ");

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

export default function ProductDetail({ product: p }: { product: AdminProductDetail }) {
  const [active, setActive] = useState(0);

  // Real product images when the vendor has uploaded any; otherwise the decorative
  // local placeholders — these are not product data.
  const remote = p.images.map((img) => img.url);
  const gallery = remote.length > 0 ? remote : productGallery(p.title);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link href="/products" className="mt-1.5 text-ink/60 hover:text-ink"><Icon name="arrow-left" size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold sm:text-[28px]">{p.title} - {naira(p.price)}</h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink/50">
              {p.category ?? "—"} · {p.vendor?.businessName ?? "Daniliya (platform)"} · {p._count.reviews} reviews
            </p>
          </div>
        </div>
        <Link
          href={`/products/${p.id}/edit`}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Icon name="settings" size={16} /> Edit product
        </Link>
      </div>

      {/* Gallery */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {gallery.map((src, i) => (
          <button
            key={src}
            onClick={() => setActive(i)}
            className={`relative aspect-[4/3] overflow-hidden rounded-2xl transition-all ${active === i ? "ring-2 ring-dashed ring-brand ring-offset-2" : "hover:opacity-90"}`}
          >
            <Image
              src={src}
              alt={`${p.title} ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
              unoptimized={remote.length > 0}
            />
          </button>
        ))}
      </div>

      {/* Key stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatFoot label="Sales Price" value={naira(p.price)} />
        <StatFoot label="Stock on hand" value={`${p.stockQuantity}`} />
        <StatFoot label="Minimum stock level" value="—" />
        <StatFoot label="Profit per unit" value="—" />
      </div>

      {/* Sales performance */}
      <p className="mt-8 text-lg font-bold text-ink/70">Sales performance</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatFoot label="Units Sold" value="—" />
        <StatFoot label="Revenue" value="—" />
        <StatFoot label="Total Profit" value="—" />
        <StatFoot label="Channels" value="—" />
      </div>

      {/* Listing status + delist/relist */}
      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-ink/50">Listing status</p>
            <p className="mt-1 flex items-center gap-2 text-lg font-bold">
              <span className={`inline-block rounded-full px-3 py-1 text-xs ${statusPill[p.status] ?? "bg-ink/8 text-ink/60"}`}>
                {statusLabel(p.status)}
              </span>
            </p>
          </div>
          <p className="max-w-sm text-xs text-ink/50">
            Delisting takes it off the storefront immediately; relisting puts it back. Editing does not change this.
          </p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {p.status === "ACTIVE" ? (
            <ActionButton
              action={() => delistProduct(p.id)}
              icon="ban"
              variant="danger"
              confirm={`Delist "${p.title}"? It will stop showing on the storefront and can't be bought until you relist it.`}
            >
              Delist product
            </ActionButton>
          ) : (
            <ActionButton
              action={() => relistProduct(p.id)}
              icon="check"
              variant="success"
              confirm={`Relist "${p.title}"? It will become buyable on the storefront again.`}
            >
              Relist product
            </ActionButton>
          )}
        </div>
      </div>

      {/* Approve / reject a vendor product that is awaiting review. */}
      {(p.status === "PENDING_REVIEW" || p.status === "REJECTED") && (
        <div className="mt-6">
          <ProductModeration id={p.id} status={p.status} rejectedReason={p.rejectedReason} />
        </div>
      )}
    </>
  );
}
