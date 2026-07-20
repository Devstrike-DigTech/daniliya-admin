import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import ProductsView, { type AdminProduct } from "./ProductsView";

export const metadata: Metadata = { title: "Products" };

type ProductsFinance = { totalSales: string; totalProfit: string };

export default async function ProductsPage() {
  const [products, finance] = await Promise.all([
    apiFetchSafe<AdminProduct[]>("/admin/products"),
    apiFetchSafe<ProductsFinance>("/admin/products/finance"),
  ]);
  return <ProductsView products={products ?? []} finance={finance} />;
}
