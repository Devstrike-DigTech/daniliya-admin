"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import CategoryCombobox from "@/components/CategoryCombobox";
import FileUpload, { type UploadedFile } from "@/components/FileUpload";
import {
  createProduct,
  updateProduct,
  type ProductInput,
  type ProductVariantType,
} from "./actions";

export type VendorOption = { id: string; businessName: string };

export type SizeRow = { name: string; price: string; stock: string };

export type ProductFormInitial = {
  title: string;
  description: string;
  price: string;
  stockQuantity: number;
  category: string;
  vendorId: string | null;
  commissionRate: string;
  affiliateEligible: boolean;
  influencerEligible: boolean;
  commissionMode: "INCLUSIVE" | "ADD_ON";
  variantType: ProductVariantType | null;
  variants: SizeRow[];
  imageUrls: string[];
};

const labelCls = "mb-1.5 block text-sm font-bold";
const inputCls =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand";

/** The buyer-facing heading each size type sets on the storefront selector. */
const SIZE_TYPES: { value: ProductVariantType; label: string; example: string }[] = [
  { value: "CLOTHING_SIZE", label: "Size", example: "S, M, L, XL, XXL" },
  { value: "DIMENSION", label: "Dimensions", example: "2m x 3m, 4m x 6m" },
  { value: "WEIGHT", label: "Weight", example: "250g, 500g, 1kg" },
  { value: "OTHER", label: "Option", example: "any labelled option" },
];

const emptyRow = (): SizeRow => ({ name: "", price: "", stock: "" });

/**
 * Create or edit a product. In create mode it can be published live or saved as
 * a draft; in edit mode the listing state (delist/relist) is handled separately
 * on the detail page, so this form only touches content.
 */
export default function ProductForm({
  vendors,
  categories,
  mode,
  productId,
  initial,
}: {
  vendors: VendorOption[];
  categories: string[];
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
  const [stock, setStock] = useState(String(initial?.stockQuantity ?? ""));
  const [category, setCategory] = useState(initial?.category ?? "");
  const [commission, setCommission] = useState(initial?.commissionRate ?? "0");
  const [affiliateEligible, setAffiliateEligible] = useState(initial?.affiliateEligible ?? true);
  const [influencerEligible, setInfluencerEligible] = useState(initial?.influencerEligible ?? true);
  const [commissionMode, setCommissionMode] = useState<"INCLUSIVE" | "ADD_ON">(
    initial?.commissionMode ?? "INCLUSIVE",
  );

  // Sizes
  const [hasSizes, setHasSizes] = useState<boolean>(!!initial?.variantType);
  const [variantType, setVariantType] = useState<ProductVariantType>(
    initial?.variantType ?? "CLOTHING_SIZE",
  );
  const [sizes, setSizes] = useState<SizeRow[]>(
    initial?.variants?.length ? initial.variants : [emptyRow(), emptyRow()],
  );

  const [publish, setPublish] = useState(true);
  const [images, setImages] = useState<UploadedFile[]>(
    (initial?.imageUrls ?? []).map((url) => ({ url, name: url.split("/").pop() ?? "image" })),
  );

  const setRow = (i: number, patch: Partial<SizeRow>) =>
    setSizes((rows) => rows.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  const addRow = () => setSizes((rows) => [...rows, emptyRow()]);
  const removeRow = (i: number) => setSizes((rows) => rows.filter((_, k) => k !== i));

  const sizeLabel = SIZE_TYPES.find((t) => t.value === variantType)?.label ?? "Option";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Give the product a title.");
    if (scope === "vendor" && !vendorId) return setError("Choose a vendor, or switch to Platform.");

    let variantFields: Pick<ProductInput, "price" | "stockQuantity" | "variantType" | "variants">;
    if (hasSizes) {
      const rows = sizes
        .map((r) => ({ name: r.name.trim(), price: r.price, stock: r.stock }))
        .filter((r) => r.name || r.price);
      if (rows.length === 0) return setError(`Add at least one ${sizeLabel.toLowerCase()}.`);
      for (const r of rows) {
        if (!r.name) return setError(`Give every ${sizeLabel.toLowerCase()} a name.`);
        if (r.price === "" || Number(r.price) < 0) return setError(`Enter a valid price for “${r.name}”.`);
      }
      variantFields = {
        variantType,
        variants: rows.map((r) => ({
          name: r.name,
          price: Number(r.price),
          stockQuantity: r.stock === "" ? 0 : Number(r.stock),
        })),
      };
    } else {
      if (price === "" || Number(price) < 0) return setError("Enter a valid price.");
      if (stock === "" || Number(stock) < 0) return setError("Enter a stock quantity.");
      variantFields = {
        price: Number(price),
        stockQuantity: Number(stock),
        // In edit mode, send an empty array + null type to clear any old sizes.
        ...(mode === "edit" ? { variantType: null, variants: [] } : {}),
      };
    }

    const input: ProductInput = {
      title: title.trim(),
      ...(mode === "create" && slug.trim() ? { slug: slug.trim() } : {}),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      vendorId: scope === "vendor" ? vendorId : null,
      commissionRate: commission === "" ? 0 : Number(commission),
      affiliateEligible,
      influencerEligible,
      commissionMode,
      imageUrls: images.map((f) => f.url),
      ...variantFields,
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

              {/* Category — pick an existing one or type a new one */}
              <div>
                <label className={labelCls}>Category</label>
                <CategoryCombobox
                  value={category}
                  onChange={setCategory}
                  categories={categories}
                />
                <p className="mt-1 text-xs text-ink/50">
                  Choose from your {categories.length} existing categor{categories.length === 1 ? "y" : "ies"}, or type a new one to create it.
                </p>
              </div>

              {/* Price + stock — only when the product is single-price */}
              {!hasSizes && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Sale price (₦)</label>
                    <input className={inputCls} type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <label className={labelCls}>Stock quantity</label>
                    <input className={inputCls} type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sizes */}
          <div className="rounded-2xl border border-ink/10 bg-white p-6">
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span className="min-w-0">
                <span className="block text-sm font-bold">This product comes in sizes</span>
                <span className="mt-0.5 block text-xs text-ink/55">
                  Turn on for clothing sizes, dimensions, weights or any options that each have their own price and stock.
                </span>
              </span>
              <input type="checkbox" checked={hasSizes} onChange={(e) => setHasSizes(e.target.checked)} className="peer sr-only" />
              <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-ink/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-brand peer-checked:after:translate-x-5" />
            </label>

            {hasSizes && (
              <div className="mt-5 space-y-5">
                <div>
                  <label className={labelCls}>What kind of sizes?</label>
                  <select className={`${inputCls} sm:max-w-[280px]`} value={variantType} onChange={(e) => setVariantType(e.target.value as ProductVariantType)}>
                    {SIZE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label} — e.g. {t.example}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-ink/50">
                    Shoppers pick a “{sizeLabel}” on the product page. The lowest price shows as the “from” price in the catalogue.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="hidden grid-cols-[1fr_130px_110px_36px] gap-3 px-1 text-xs font-bold uppercase tracking-wide text-ink/45 sm:grid">
                    <span>{sizeLabel}</span>
                    <span>Price (₦)</span>
                    <span>Stock</span>
                    <span />
                  </div>
                  {sizes.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_36px] items-center gap-3 sm:grid-cols-[1fr_130px_110px_36px]">
                      <input className={inputCls} value={row.name} onChange={(e) => setRow(i, { name: e.target.value })} placeholder={variantType === "DIMENSION" ? "2m x 3m" : variantType === "WEIGHT" ? "500g" : "XL"} />
                      <input className={`${inputCls} max-sm:col-span-1`} type="number" min={0} step="0.01" value={row.price} onChange={(e) => setRow(i, { price: e.target.value })} placeholder="Price" />
                      <input className={`${inputCls} max-sm:col-span-1`} type="number" min={0} value={row.stock} onChange={(e) => setRow(i, { stock: e.target.value })} placeholder="Stock" />
                      <button type="button" onClick={() => removeRow(i)} disabled={sizes.length <= 1} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/40 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-30" aria-label="Remove size">
                        <Icon name="close" size={16} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addRow} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-ink/25 px-4 py-2.5 text-sm font-bold text-ink/70 transition-colors hover:border-brand hover:text-brand">
                    <Icon name="plus" size={16} /> Add {sizeLabel.toLowerCase()}
                  </button>
                </div>
              </div>
            )}
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
