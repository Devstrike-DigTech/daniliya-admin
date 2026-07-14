import type { Metadata } from "next";
import { adminCampaigns } from "@/lib/dashboard";
import CampaignDetail from "./CampaignDetail";

export function generateStaticParams() {
  return adminCampaigns.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = adminCampaigns.find((x) => x.id === id);
  return { title: c ? c.name : "Campaign" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CampaignDetail id={id} />;
}
