import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import VendorsView, { type VendorRow } from "./VendorsView";

export const metadata: Metadata = { title: "Vendors" };

export default async function VendorsPage() {
  const vendors = await apiFetchSafe<VendorRow[]>("/admin/vendors");
  return <VendorsView vendors={vendors ?? []} />;
}
