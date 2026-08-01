import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import type { AdminProduct } from "@/app/products/ProductsView";
import ResourcesView from "./ResourcesView";
import type { AdminResource } from "./actions";

export const metadata: Metadata = { title: "Resources" };

export default async function ResourcesPage() {
  const [resources, products] = await Promise.all([
    apiFetchSafe<AdminResource[]>("/admin/resources"),
    apiFetchSafe<AdminProduct[]>("/admin/products"),
  ]);
  const productOptions = (products ?? []).map((p) => ({ id: p.id, title: p.title }));
  return <ResourcesView resources={resources ?? []} products={productOptions} />;
}
