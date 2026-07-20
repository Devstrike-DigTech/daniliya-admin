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
  const [product, vendors] = await Promise.all([
    apiFetchSafe<AdminProductDetail>(`/admin/products/${id}`),
    apiFetchSafe<VendorOption[]>("/admin/products/vendor-options"),
  ]);
  if (!product) notFound();

  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      vendors={vendors ?? []}
      initial={{
        title: product.title,
        description: product.description ?? "",
        price: product.price,
        costPrice: product.costPrice ?? "",
        stockQuantity: product.stockQuantity,
        category: product.category ?? "",
        vendorId: product.vendorId,
        commissionRate: product.commissionRate,
        affiliateEligible: product.affiliateEligible,
        influencerEligible: product.influencerEligible,
        commissionMode: product.commissionMode,
        imageUrls: product.images.map((i) => i.url),
      }}
    />
  );
}
