import type { Metadata } from "next";
import InfluencersView from "./InfluencersView";

export const metadata: Metadata = { title: "Influencers" };

export default function InfluencersPage() {
  return <InfluencersView />;
}
