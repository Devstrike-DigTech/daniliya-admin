import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetchSafe } from "@/lib/api";
import VendorDetail, { type VendorDetailData } from "./VendorDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const v = await apiFetchSafe<VendorDetailData>(`/admin/vendors/${id}`);
  return { title: v ? v.businessName : "Vendor" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = await apiFetchSafe<VendorDetailData>(`/admin/vendors/${id}`);
  if (!vendor) notFound();
  return <VendorDetail vendor={vendor} />;
}
