import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetchSafe } from "@/lib/api";
import InfluencerDetail, { type InfluencerDetailData } from "./InfluencerDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const i = await apiFetchSafe<InfluencerDetailData>(`/admin/influencers/${id}`);
  return { title: i ? `${i.user.firstName} ${i.user.lastName}` : "Influencer" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const influencer = await apiFetchSafe<InfluencerDetailData>(`/admin/influencers/${id}`);
  if (!influencer) notFound();
  return <InfluencerDetail influencer={influencer} />;
}
