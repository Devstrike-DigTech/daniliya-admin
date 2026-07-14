import type { Metadata } from "next";
import CampaignsView from "./CampaignsView";

export const metadata: Metadata = { title: "Campaigns" };

export default function CampaignsPage() {
  return <CampaignsView />;
}
