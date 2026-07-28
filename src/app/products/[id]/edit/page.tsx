import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetchSafe } from "@/lib/api";
import ProductForm, { type VendorOption } from "../../ProductForm";
import type { AdminProductDetail } from "../ProductDetail";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, vendors, categories] = await Promise.all([
    apiFetchSafe<AdminProductDetail>(`/admin/products/${id}`),
    apiFetchSafe<VendorOption[]>("/admin/products/vendor-options"),
    apiFetchSafe<string[]>("/products/categories"),
  ]);
  if (!product) notFound();

  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      vendors={vendors ?? []}
      categories={categories ?? []}
      initial={{
        title: product.title,
        description: product.description ?? "",
        price: product.price,
        stockQuantity: product.stockQuantity,
        category: product.category ?? "",
        vendorId: product.vendorId,
        commissionRate: product.commissionRate,
        affiliateEligible: product.affiliateEligible,
        influencerEligible: product.influencerEligible,
        commissionMode: product.commissionMode,
        variantType: product.variantType,
        variants: (product.variants ?? []).map((v) => ({
          name: v.name,
          price: String(Number(v.price)),
          stock: String(v.stockQuantity),
        })),
        imageUrls: product.images.map((i) => i.url),
      }}
    />
  );
}
