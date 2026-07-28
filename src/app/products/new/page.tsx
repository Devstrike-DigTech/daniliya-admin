import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import ProductForm, { type VendorOption } from "../ProductForm";

export const metadata: Metadata = { title: "Add a product" };

export default async function NewProductPage() {
  const [vendors, categories] = await Promise.all([
    apiFetchSafe<VendorOption[]>("/admin/products/vendor-options"),
    apiFetchSafe<string[]>("/products/categories"),
  ]);
  return (
    <ProductForm mode="create" vendors={vendors ?? []} categories={categories ?? []} />
  );
}
