import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetchSafe } from "@/lib/api";
import CampaignDetail, {
  type AdminCampaignDetail,
  type CampaignSubmission,
} from "./CampaignDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const campaign = await apiFetchSafe<AdminCampaignDetail>(`/admin/campaigns/${id}`);
  return { title: campaign?.title ?? "Campaign" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const campaign = await apiFetchSafe<AdminCampaignDetail>(`/admin/campaigns/${id}`);
  if (!campaign) notFound();

  const submissions = await apiFetchSafe<CampaignSubmission[]>(`/admin/campaigns/${id}/submissions`);

  return <CampaignDetail campaign={campaign} submissions={submissions ?? []} />;
}
