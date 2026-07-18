import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetchSafe } from "@/lib/api";
import ProductDetail, { type AdminProductDetail } from "./ProductDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await apiFetchSafe<AdminProductDetail>(`/admin/products/${id}`);
  return { title: p ? p.title : "Product" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await apiFetchSafe<AdminProductDetail>(`/admin/products/${id}`);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
