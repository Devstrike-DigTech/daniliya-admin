"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import ActionButton from "@/components/ActionButton";
import { productGallery } from "@/lib/dashboard";
import ProductModeration from "../ProductModeration";
import { delistProduct, relistProduct, featureProduct, unfeatureProduct } from "../actions";

export type AdminProductDetail = {
  id: string;
  vendorId: string | null;
  title: string;
  slug: string;
  description: string | null;
  price: string;
  costPrice: string | null;
  commissionRate: string;
  affiliateEligible: boolean;
  influencerEligible: boolean;
  commissionMode: "INCLUSIVE" | "ADD_ON";
  isFeaturedBook: boolean;
  stockQuantity: number;
  variantType: "CLOTHING_SIZE" | "DIMENSION" | "WEIGHT" | "OTHER" | null;
  variants: { id: string; name: string; price: string; stockQuantity: number; sortOrder: number }[];
  category: string | null;
  status: string;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
  vendor: { id: string; businessName: string } | null;
  images: { id: string; url: string; sortOrder: number }[];
  _count: { orderItems: number; reviews: number };
  economics: {
    unitsSold: number;
    revenue: string;
    cost: string;
    perkCommissions: string;
    profit: string;
  };
};

const naira = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

/** Buyer-facing heading for each size type. */
const SIZE_LABEL: Record<string, string> = {
  CLOTHING_SIZE: "Size",
  DIMENSION: "Dimensions",
  WEIGHT: "Weight",
  OTHER: "Option",
};

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

  const perUnit =
    p.economics.unitsSold > 0
      ? Number(p.economics.profit) / p.economics.unitsSold
      : null;

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
        <StatFoot label={p.variantType ? "From (lowest size)" : "Sale price"} value={naira(p.price)} />
        <StatFoot label={p.vendorId ? "Vendor cost price" : "Cost basis"} value={p.costPrice ? naira(p.costPrice) : "—"} />
        <StatFoot label="Stock on hand" value={`${p.stockQuantity}`} />
        <StatFoot label="Profit per unit sold" value={perUnit === null ? "—" : naira(perUnit)} />
      </div>

      {/* Sizes, when the product has them */}
      {p.variantType && p.variants.length > 0 && (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
          <p className="flex items-center gap-2 font-bold">
            <Icon name="package" size={16} className="text-brand" />
            {SIZE_LABEL[p.variantType]} options
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                  <th className="py-2.5 pr-4 font-bold">{SIZE_LABEL[p.variantType]}</th>
                  <th className="px-4 py-2.5 font-bold">Price</th>
                  <th className="px-4 py-2.5 text-right font-bold">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {p.variants.map((v) => (
                  <tr key={v.id}>
                    <td className="py-3 pr-4 font-bold">{v.name}</td>
                    <td className="px-4 py-3">{naira(v.price)}</td>
                    <td className="px-4 py-3 text-right text-ink/70">{v.stockQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sales performance — real, from paid orders */}
      <p className="mt-8 text-lg font-bold text-ink/70">Sales performance</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatFoot label="Units sold" value={`${p.economics.unitsSold}`} />
        <StatFoot label="Revenue" value={naira(p.economics.revenue)} />
        <StatFoot label="Cost + commissions" value={naira(Number(p.economics.cost) + Number(p.economics.perkCommissions))} />
        <StatFoot label="Total profit" value={naira(p.economics.profit)} />
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

      {/* Featured book — designate this product as the storefront Builder's Handbook */}
      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 font-bold">
              <Icon name="book" size={16} className="text-brand" />
              Builder&apos;s Handbook (featured book)
            </p>
            <p className="mt-1 max-w-md text-xs text-ink/55">
              {p.isFeaturedBook
                ? "This is the product shown as the Builder's Handbook on the storefront. Its title, image and description power the shop hero."
                : "Show this product as the Builder's Handbook on the storefront. Only one product can be featured — setting this replaces any current one."}
            </p>
          </div>
          {p.isFeaturedBook ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-xs font-bold text-brand">
                <Icon name="check" size={13} /> Featured
              </span>
              <ActionButton action={() => unfeatureProduct(p.id)} icon="close" variant="outline">
                Remove
              </ActionButton>
            </div>
          ) : (
            <ActionButton
              action={() => featureProduct(p.id)}
              icon="book"
              variant="primary"
              confirm={`Show "${p.title}" as the Builder's Handbook on the storefront? It replaces any product currently featured.`}
            >
              Set as the book
            </ActionButton>
          )}
        </div>
        {p.isFeaturedBook && p.status !== "ACTIVE" && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700">
            It&apos;s featured but {p.status.toLowerCase()} — the storefront shows it as
            &ldquo;currently unavailable&rdquo; until you publish it.
          </p>
        )}
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
