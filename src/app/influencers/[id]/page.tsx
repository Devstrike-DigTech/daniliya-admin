import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { influencers } from "@/lib/dashboard";
import InfluencerDetail from "./InfluencerDetail";

export function generateStaticParams() {
  return influencers.map((i) => ({ id: i.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const i = influencers.find((x) => x.id === id);
  return { title: i ? i.name : "Influencer" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const influencer = influencers.find((x) => x.id === id);
  if (!influencer) notFound();
  return <InfluencerDetail influencer={influencer} />;
}
