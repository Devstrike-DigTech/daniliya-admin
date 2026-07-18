import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetchSafe } from "@/lib/api";
import AffiliateDetail, { type AffiliateDetailData } from "./AffiliateDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = await apiFetchSafe<AffiliateDetailData>(`/admin/affiliates/${id}`);
  return { title: a ? `${a.user.firstName} ${a.user.lastName}` : "Affiliate" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const affiliate = await apiFetchSafe<AffiliateDetailData>(`/admin/affiliates/${id}`);
  if (!affiliate) notFound();
  return <AffiliateDetail affiliate={affiliate} />;
}
