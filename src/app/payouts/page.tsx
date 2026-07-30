import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import PayoutsView, { type PayoutRow, type PendingSummary } from "./PayoutsView";

export const metadata: Metadata = { title: "Payouts" };

export default async function PayoutsPage() {
  const [payouts, pending] = await Promise.all([
    apiFetchSafe<PayoutRow[]>("/admin/payouts"),
    apiFetchSafe<PendingSummary>("/admin/payouts/pending"),
  ]);
  return <PayoutsView payouts={payouts ?? []} pending={pending ?? null} />;
}
