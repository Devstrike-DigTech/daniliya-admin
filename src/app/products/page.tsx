import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import ProductsView, { type AdminProduct } from "./ProductsView";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const products = await apiFetchSafe<AdminProduct[]>("/admin/products");
  return <ProductsView products={products ?? []} />;
}
