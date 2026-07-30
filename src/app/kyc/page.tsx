import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import KycReviewView, { type KycSubmission } from "./KycReviewView";

export const metadata: Metadata = { title: "KYC review" };

export default async function KycPage() {
  // Defaults to the queue (SUBMITTED + PENDING_MANUAL) on the API.
  const queue = await apiFetchSafe<KycSubmission[]>("/admin/kyc");
  return <KycReviewView queue={queue ?? []} />;
}
