import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import PayoutsView, { type PayoutRow } from "./PayoutsView";

export const metadata: Metadata = { title: "Payouts" };

export default async function PayoutsPage() {
  const payouts = await apiFetchSafe<PayoutRow[]>("/admin/payouts");
  return <PayoutsView payouts={payouts ?? []} />;
}
