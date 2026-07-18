import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import AffiliatesView, { type AffiliateRow } from "./AffiliatesView";

export const metadata: Metadata = { title: "Affiliates" };

export default async function AffiliatesPage() {
  const affiliates = await apiFetchSafe<AffiliateRow[]>("/admin/affiliates");
  return <AffiliatesView affiliates={affiliates ?? []} />;
}
