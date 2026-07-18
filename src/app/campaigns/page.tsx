import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import CampaignsView, { type AdminCampaign, type CampaignProduct } from "./CampaignsView";

export const metadata: Metadata = { title: "Campaigns" };

export default async function CampaignsPage() {
  const [campaigns, products] = await Promise.all([
    apiFetchSafe<AdminCampaign[]>("/admin/campaigns"),
    apiFetchSafe<CampaignProduct[]>("/admin/products"),
  ]);

  return <CampaignsView campaigns={campaigns ?? []} products={products ?? []} />;
}
