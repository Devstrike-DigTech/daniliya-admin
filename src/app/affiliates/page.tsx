import type { Metadata } from "next";
import AffiliatesView from "./AffiliatesView";

export const metadata: Metadata = { title: "Affiliates" };

export default function AffiliatesPage() {
  return <AffiliatesView />;
}
