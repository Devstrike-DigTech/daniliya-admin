"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import FileUpload, { type UploadedFile } from "@/components/FileUpload";
import { createProduct, updateProduct, type ProductInput } from "./actions";

export type VendorOption = { id: string; businessName: string };

export type ProductFormInitial = {
  title: string;
  description: string;
  price: string;
  costPrice: string;
  stockQuantity: number;
  category: string;
  vendorId: string | null;
  commissionRate: string;
  affiliateEligible: boolean;
  influencerEligible: boolean;
  commissionMode: "INCLUSIVE" | "ADD_ON";
  imageUrls: string[];
};

const labelCls = "mb-1.5 block text-sm font-bold";
const inputCls =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";

/**
 * Create or edit a product. In create mode it can be published live or saved as
 * a draft; in edit mode the listing state (delist/relist) is handled separately
 * on the detail page, so this form only touches content.
 */
export default function ProductForm({
  vendors,
  mode,
  productId,
  initial,
}: {
  vendors: VendorOption[];
  mode: "create" | "edit";
  productId?: string;
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [scope, setScope] = useState<"platform" | "vendor">(
    initial?.vendorId ? "vendor" : "platform",
  );
  const [vendorId, setVendorId] = useState(initial?.vendorId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [costPrice, setCostPrice] = useState(initial?.costPrice ?? "");
  const [stock, setStock] = useState(String(initial?.stockQuantity ?? ""));
  const [category, setCategory] = useState(initial?.category ?? "");
  const [commission, setCommission] = useState(initial?.commissionRate ?? "0");
  const [affiliateEligible, setAffiliateEligible] = useState(initial?.affiliateEligible ?? true);
  const [influencerEligible, setInfluencerEligible] = useState(initial?.influencerEligible ?? true);
  const [commissionMode, setCommissionMode] = useState<"INCLUSIVE" | "ADD_ON">(
    initial?.commissionMode ?? "INCLUSIVE",
  );
  const [publish, setPublish] = useState(true);
  const [images, setImages] = useState<UploadedFile[]>(
    (initial?.imageUrls ?? []).map((url) => ({ url, name: url.split("/").pop() ?? "image" })),
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Give the product a title.");
    if (price === "" || Number(price) < 0) return setError("Enter a valid price.");
    if (stock === "" || Number(stock) < 0) return setError("Enter a stock quantity.");
    if (scope === "vendor" && !vendorId) return setError("Choose a vendor, or switch to Platform.");

    const input: ProductInput = {
      title: title.trim(),
      ...(mode === "create" && slug.trim() ? { slug: slug.trim() } : {}),
      description: description.trim() || undefined,
      price: Number(price),
      stockQuantity: Number(stock),
      category: category.trim() || undefined,
      vendorId: scope === "vendor" ? vendorId : null,
      commissionRate: commission === "" ? 0 : Number(commission),
      costPrice: costPrice === "" ? undefined : Number(costPrice),
      affiliateEligible,
      influencerEligible,
      commissionMode,
      imageUrls: images.map((f) => f.url),
    };

    startTransition(async () => {
      if (mode === "create") {
        const res = await createProduct({ ...input, publish });
        if (!res.ok) return setError(res.error);
        router.push(res.id ? `/products/${res.id}` : "/products");
      } else {
        const res = await updateProduct(productId!, input);
        if (!res.ok) return setError(res.error);
        router.push(`/products/${productId}`);
      }
    });
  };

  return (
    <form onSubmit={submit}>
      <div className="flex items-start gap-3">
        <Link href={mode === "edit" ? `/products/${productId}` : "/products"} className="mt-1.5 text-ink/60 hover:text-ink">
          <Icon name="arrow-left" size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold sm:text-[28px]">
            {mode === "create" ? "Add a product" : "Edit product"}
          </h1>
          <p className="mt-0.5 text-sm text-ink/55">
            {mode === "create"
              ? "Publish a platform product or list one on a vendor's behalf."
              : "Update details, images and vendor attribution."}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Ownership */}
          <div className="rounded-2xl border border-ink/10 bg-white p-6">
            <p className="text-sm font-bold">Who is selling this?</p>
            <div className="mt-3 flex rounded-2xl bg-ink/5 p-1.5">
              {(["platform", "vendor"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold capitalize transition-colors ${scope === s ? "bg-white shadow-sm" : "text-ink/55 hover:text-ink"}`}
                >
                  {s === "platform" ? "Daniliya (platform)" : "A vendor"}
                </button>
              ))}
            </div>
            {scope === "vendor" && (
              <div className="mt-4">
                <label className={labelCls}>Vendor</label>
                <select className={inputCls} value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                  <option value="">Select a vendor…</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.businessName}</option>
                  ))}
                </select>
                {vendors.length === 0 && (
                  <p className="mt-2 text-xs text-ink/50">No approved vendors yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="rounded-2xl border border-ink/10 bg-white p-6">
            <p className="text-sm font-bold">Product details</p>
            <div className="mt-4 space-y-5">
              <div>
                <label className={labelCls}>Title</label>
                <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lavender Floor Cleaner 5L" />
              </div>
              {mode === "create" && (
                <div>
                  <label className={labelCls}>URL slug (optional)</label>
                  <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Auto from title — e.g. builders-handbook" />
                  <p className="mt-1 text-xs text-ink/50">
                    Sets the storefront address (/shop/<span className="font-mono">{slug.trim() || "slug"}</span>). Leave blank to generate it from the title.
                  </p>
                </div>
              )}
              <div>
                <label className={labelCls}>Description</label>
                <textarea className={`${inputCls} min-h-[110px]`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is it, and why should someone buy it?" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Sale price (₦)</label>
                  <input className={inputCls} type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>
                    {scope === "vendor" ? "Vendor / cost price (₦)" : "Cost price (₦)"}
                  </label>
                  <input className={inputCls} type="number" min={0} step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="Optional — your cost basis" />
                </div>
                <div>
                  <label className={labelCls}>Stock quantity</label>
                  <input className={inputCls} type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Home, Beauty" />
                </div>
              </div>
              <p className="mt-2 text-xs text-ink/50">
                Cost price is the platform&apos;s cost basis — the vendor&apos;s price for
                vendor products, or your own cost for platform products. It drives the
                profit figures and is never shown to shoppers.
              </p>
            </div>
          </div>

          {/* Commissions & eligibility */}
          <div className="rounded-2xl border border-ink/10 bg-white p-6">
            <p className="text-sm font-bold">Commissions &amp; eligibility</p>

            <div className="mt-4 space-y-3">
              <Toggle
                label="Eligible for the affiliate programme"
                hint="Affiliates earn a referral commission when this product sells."
                checked={affiliateEligible}
                onChange={setAffiliateEligible}
              />
              <Toggle
                label="Eligible for influencer campaigns"
                hint="Creators can feature it and earn campaign commission on sales."
                checked={influencerEligible}
                onChange={setInfluencerEligible}
              />
            </div>

            <div className="mt-5">
              <label className={labelCls}>Affiliate commission (%)</label>
              <input className={`${inputCls} sm:max-w-[220px]`} type="number" min={0} max={100} step="0.1" value={commission} onChange={(e) => setCommission(e.target.value)} placeholder="0" />
            </div>

            <div className="mt-5">
              <p className={labelCls}>How is commission applied?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["INCLUSIVE", "Taken from the price", "Commission comes out of the sale price — your margin absorbs it."],
                    ["ADD_ON", "Added on top", "Commission is added to the price, so the customer covers it."],
                  ] as const
                ).map(([val, title, desc]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCommissionMode(val)}
                    className={`rounded-xl border p-4 text-left transition-colors ${commissionMode === val ? "border-brand bg-brand/5" : "border-ink/15 hover:bg-ink/[0.03]"}`}
                  >
                    <span className="flex items-center gap-2 text-sm font-bold">
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${commissionMode === val ? "border-brand" : "border-ink/30"}`}>
                        {commissionMode === val && <span className="h-2 w-2 rounded-full bg-brand" />}
                      </span>
                      {title}
                    </span>
                    <span className="mt-1 block text-xs text-ink/55">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-2xl border border-ink/10 bg-white p-6">
            <p className="text-sm font-bold">Images</p>
            <p className="mb-3 mt-0.5 text-xs text-ink/50">Up to 8. JPEG, PNG or WebP, max 5MB each.</p>
            <FileUpload
              purpose="product"
              accept="image/jpeg,image/png,image/webp"
              multiple
              value={images}
              onChange={setImages}
              hint="The first image is the cover."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-ink/10 bg-white p-6">
            <p className="text-sm font-bold">Publish</p>
            {mode === "create" ? (
              <label className="mt-4 flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="peer sr-only" />
                <span className="relative h-6 w-11 shrink-0 rounded-full bg-ink/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-brand peer-checked:after:translate-x-5" />
                <span className="text-sm text-ink/70">{publish ? "Publish live now" : "Save as draft"}</span>
              </label>
            ) : (
              <p className="mt-2 text-xs text-ink/55">Listing status (live / delisted) is managed from the product page.</p>
            )}

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Icon name={pending ? "clock" : "check"} size={16} />
              {pending ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-ink/10 bg-white p-4">
      <span className="min-w-0">
        <span className="block text-sm font-bold">{label}</span>
        <span className="mt-0.5 block text-xs text-ink/55">{hint}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-ink/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-brand peer-checked:after:translate-x-5" />
    </label>
  );
}
