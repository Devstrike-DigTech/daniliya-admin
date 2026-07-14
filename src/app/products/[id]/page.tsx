import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminProducts } from "@/lib/dashboard";
import ProductDetail from "./ProductDetail";

export function generateStaticParams() {
  return adminProducts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = adminProducts.find((x) => x.id === id);
  return { title: p ? p.name : "Product" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = adminProducts.find((p) => p.id === id);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
