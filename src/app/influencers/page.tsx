import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import InfluencersView, { type InfluencerRow } from "./InfluencersView";

export const metadata: Metadata = { title: "Influencers" };

export default async function InfluencersPage() {
  const influencers = await apiFetchSafe<InfluencerRow[]>("/admin/influencers");
  return <InfluencersView influencers={influencers ?? []} />;
}
